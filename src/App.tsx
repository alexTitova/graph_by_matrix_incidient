import React, {SFC} from 'react';
import logo from './logo.svg';
import './App.css';
import {
    adapter,
    graphModel,
    GraphVisualizer,
    IGraphView,
    store,
    Template,
    Toolbar,
    ToolButtonList
} from "graphlabs.core.template";
import {IVertex,IGraph, IEdge, GraphGenerator, Graph, Vertex, Edge } from 'graphlabs.core.graphs';

import {Matrix, } from 'graphlabs.core.lib';
import {rename} from "fs";


class App extends Template
{
    task_part =1;
    chekc_count=0; //количество проверок
    graph: IGraph<IVertex, IEdge> = this.empty_graph();  //ф студента
    matrix: number [][] = [[1, 1, 1],
                            [1, 0,0],
                             [0,1,0],
                            [0,0,1]]; //матрицв тиз варианта
    //matrix:number [][] = store.GetState().matrix


    constructor(props:{})
    {
        super(props);
        this.calculate = this.calculate.bind(this);
        this.getArea = this.getArea.bind(this);
    }





    protected getArea(): React.SFC<{}>
    {
        this.graph = this.empty_graph();
        return () => <GraphVisualizer
            //graph = {GraphGenerator.generate(0)} //вот здесь не генерится
            graph={this.graph}
            adapterType={'writable'}
            incidentEdges={false}
            weightedEdges={false}
            namedEdges={true}
        />;
    }



    getTaskToolbar()
    {
        Toolbar.prototype.getButtonList = () => {
            function beforeComplete(this: App):  Promise<{ success: boolean; fee: number }> {
                return new Promise((resolve => {
                    resolve(this.calculate());
                }));
            }
            ToolButtonList.prototype.beforeComplete = beforeComplete.bind(this);
            ToolButtonList.prototype.help = () =>
                'В данном задании необходимо построить граф по данной матрице инциденций';


            return ToolButtonList;
        };
        return Toolbar;
    }

    private empty_graph():IGraph<IVertex, IEdge>{
        const data = sessionStorage.getItem('variant');
        let graph: IGraph<IVertex, IEdge> = new Graph() as unknown as IGraph<IVertex, IEdge>;
        let objectData;
        try {
            objectData = JSON.parse(data || 'null');
        } catch (err) {
            console.log('Error while JSON parsing');
        }
        if (objectData && objectData.data[0] && objectData.data[0].type === 'graph') {
            graph = this.graphManager(objectData.data[0].value);
            const vertices = objectData.data[0].value.graph.vertices;
            const edges  = objectData.data[0].value.graph.edges;
            vertices.forEach((v: any) => {
                graph.addVertex(new Vertex(v));
            });
            edges.forEach((e: any) => {
                if (e.name) {
                    graph.addEdge(new Edge(graph.getVertex(e.source)[0], graph.getVertex(e.target)[0], e.name[0]));
                } else {
                    graph.addEdge(new Edge(graph.getVertex(e.source)[0], graph.getVertex(e.target)[0],Math.round(Math.random()*10).toString() ));
                }
            });
        }
        return graph;
    }



    private get_matrixIncidient_byGraph(student_graph: IGraph<IVertex, IEdge>): number[][]
    {
        let result: number[][]=[]

        for(let i:number =0; i<student_graph.vertices.length;i++)
        {
            result.push([]);
            for(let j:number =0; j<student_graph.edges.length;j++)
            {
                if(student_graph.vertices[i].isIncident(student_graph.edges[j]))
                {
                    result[i].push(1);
                }
                else
                {
                    result[i].push(0);
                }
            }

        }

        return result;
    }

    private graph_check(): boolean
    {
        let flag: boolean = true;
        let matrixInc_by_student_graph:number[][] = this.get_matrixIncidient_byGraph(this.graph);
        let i:number =0;
        let j:number =0;

        if(this.graph.vertices.length===this.matrix.length && this.graph.edges.length===this.matrix[0].length)
        {
            while (flag && i<this.graph.vertices.length)
            {

                    while (flag && j < this.graph.edges.length)
                    {
                        if (matrixInc_by_student_graph[i][j] !== this.matrix[i][j])
                        {
                            flag = false;
                            this.chekc_count += 1;
                        }
                        j += 1;
                    }

                i+=1;

            }
        }
        else
        {
            flag=false;
            this.chekc_count+=1;
        }



        return flag;
    }


// @ts-ignore
    task(): FunctionComponent<{}> {
        if (this.task_part === 1) {
            return () =>
                <div>
                    <form>
                        <span> Матрица инциденций </span>

                        <Matrix rows={this.matrix.length}
                                columns={this.matrix[0].length}
                                readonly={true}
                                defaultValues={this.matrix}/>

                        <button type="button"
                                onClick={() => {
                                    this.task_part += 1;
                                    this.forceUpdate();
                                }}> Проверить граф
                        </button>
                    </form>
                </div>
        }
        if (this.task_part === 2) {
            if (this.graph_check())
                return () => (
                    <div>
                        <form>
                            <span> Все правильно. Нажмите зеленую галочку для подсчета результата</span>
                        </form>
                    </div>
                );
            else {
                return () => (
                    <div>
                        <form>
                            <span> Есть ошибки</span>
                            <button type="button"
                                    onClick={() => {
                                        this.task_part = 1;
                                        this.forceUpdate();
                                    }}> Исправить ошибки
                            </button>
                        </form>
                    </div>
                );
            }
        }


    }


    private calculate()
    {
        let  res:number = this.chekc_count*(this.graph.edges.length+this.graph.vertices.length);
        return {success: res===0, fee: res}
    }
}

export default App;
