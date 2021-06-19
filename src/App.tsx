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
    graph: IGraph<IVertex, IEdge> = GraphGenerator.generate(0);
    matrix: number [][] = this.get_matrix_by_variant();
    //matrix: number [][] = [[1, 1, 1],
    //                        [1, 0,0],
    //                         [0,1,0],
    //                        [0,0,1]]; //матрицв тиз варианта



    constructor(props:{})
    {
        super(props);
        this.calculate = this.calculate.bind(this);
        this.getArea = this.getArea.bind(this);
    }



    componentWillMount()
    {
        //для инициализации графа
        let graphModel:  IGraph<IVertex, IEdge> = new Graph() as unknown as IGraph<IVertex, IEdge>;
        let init:(graph: IGraph<IVertex, IEdge>) => void;
        init = function (graph: IGraph<IVertex, IEdge>) {
            graphModel = graph;
        }
        //

        init(this.graph);

        console.log("component")
    }

    protected getArea(): React.SFC<{}>
    {
        //      this.graph = this.empty_graph();
        // this.graph = this.graph_by_variant();
        //    this.matrix = this.get_matrix_by_variant();
        console.log("getArea");
        return () => <GraphVisualizer
            graph = {graphModel} //вот здесь не генерится
            // graph={this.graph}
            //    graph = { GraphGenerator.generate(0)}
            adapterType={'writable'}
            incidentEdges={false}
            weightedEdges={false}
            namedEdges={true}
        />;

    }

    private get_matrix_by_variant():number[][]
    {
        const data = sessionStorage.getItem('variant');
        let matrix:number[][] = [];
        let objectData;
        try
        {
            objectData = JSON.parse(data || 'null');
            console.log('The variant is successfully parsed');
        }
        catch(err)
        {
            console.log('Error while JSON parsing');
        }
        console.log(this.matrixManager(objectData.data[0].value));
        if(data)
        {
            matrix=this.matrixManager(objectData.data[0].value);
            console.log('The matrix is successfully built from the variant');
        }

        console.log("matrix_by var");
        return matrix;
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
    /*
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
*/


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
        let matrixInc_by_student_graph:number[][] = this.get_matrixIncidient_byGraph(graphModel);
        let i:number =0;
        let j:number =0;

        if(graphModel.vertices.length===this.matrix.length && graphModel.edges.length===this.matrix[0].length)
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
                        <span> Постройте граф по матрице</span>
                        <span> Матрица инциденций </span>
                        <br/>
                        <Matrix rows={this.matrix.length}
                                columns={this.matrix[0].length}
                                readonly={true}
                                defaultValues={this.matrix}/>

                    </form>
                </div>
        }



    }


    private calculate()
    {
        let isChecked = this.graph_check();
        let res:number = 0;
        if(!isChecked) {
            res = this.chekc_count * (graphModel.edges.length + graphModel.vertices.length);
        }
        return {success: res===0, fee: res}
    }
}

export default App;
