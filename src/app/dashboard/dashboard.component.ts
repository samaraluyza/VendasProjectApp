import { CoqueValor } from './../util/CoqueValor';
// import { Drilldown } from 'highcharts';

/**
 * Created by mohma on 7/26/2017.
 */
//import * as Highcharts from 'highcharts';
import { Component, OnInit } from '@angular/core';
import { StatsCard } from "../components/statsCard/statsCard";
import { PieChart } from "../components/pieChart/pieChart";
import { FuncionarioVendasViewModel } from 'app/models/funcionarioViewModel';
import { SerieDrilldownViewModel } from 'app/models/serieDrilldownViewModel';
//import Drilldown from "highcharts" 
// Drilldown(Highcharts);
declare var Highcharts: any;
@Component({
  templateUrl: './dashboard.component.html',
  selector: 'dashboard',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  urlRH = "https://sigerh.azurewebsites.net/api/";
  urlMV = "https://sigemv.azurewebsites.net/api/";
  urlFinanceiro = "http://trabalhosige.azurewebsites.net/api/";
  urlProd = "?";


  listaFuncionarios: any[];
  ngOnInit(): void {
    this.listaFuncionarios = [];
    this.listaFuncionarios = this.getFuncionarios();
    var funci = [];
    this.listaFuncionarios.forEach(F => {
      if (F.Cargo == "Vendedor" && funci.length < 2)
        funci.push(F);
    });

    var funciProntos = [];
    var listaDrilldown = [];
    funci.forEach((fp,index) => {
      var fvm = new FuncionarioVendasViewModel();
      fvm.name = fp.Nome;
      fvm.y = 4000000 - ((index + 1 )) * 70000;
      var dd = new SerieDrilldownViewModel();
      dd.id = "total" + fvm.name.trim();
      fvm.drilldown = dd.id;
      dd.colorByPoint = true;
      dd.name = "Tipos Coque x Valor"
      dd.data.push(CoqueValor.returnCoqueValor("Ótimo", 2500000 - ((index + 1 )) * 70000));
      dd.data.push(CoqueValor.returnCoqueValor("Bom", 1000000 - ((index + 1 )) * 70000));
      dd.data.push(CoqueValor.returnCoqueValor("Médio", 750000 - ((index + 1 )) * 70000));
      //dd.data.push(CoqueValor.returnCoqueValor("Ruim", 250000 - ((index + 1 )) * 70000));
      funciProntos.push(fvm);
      listaDrilldown.push(dd);
    });

    Highcharts.chart('container',
      {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Relatório Vendas por Funcionário em Reais'
        },
        xAxis: {
          type: 'category'
        },

        legend: {
          enabled: false
        },

        plotOptions: {
          series: {
            borderWidth: 0,
            dataLabels: {
              enabled: true
            }
          }
        },
        series: [{
          name: 'Funcionários',
          colorByPoint: true,
          data: funciProntos


          // [{
          //   name: 'Samara',
          //   y: 4000000,
          //   drilldown: 'totalSamara'
          // }]
        }],
        drilldown: {
          series: listaDrilldown



          // [{
          //   id: 'totalSamara',
          //   colorByPoint: true,
          //   name: 'Tipos Coque x Valor',
          //   data: [
          //     ['Ótimo', 2500000],
          //     ['Bom', 1000000],
          //     ['Médio', 750000],
          //     ['Ruim', 250000]
          //   ]
          // }// }, {

          //   //   id: 'tiposSamara',
          //   //   name: 'Tipos Coque x Valor',
          //   //   data: [
          //   //     ['Ótimo', 2500000],
          //   //     ['Bom', 1000000],
          //   //     ['Médio', 750000],
          //   //     ['Ruim', 250000]
          //   //   ]
          //   // }
          // ]
        }
      });


  }

  httpGet(Url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
    }

    xmlHttp.open("GET", Url, false); // true for asynchronous 
    xmlHttp.send();
  }

  getFuncionarios(): any {
    var result;
    this.httpGet(this.urlRH + "Funcionarios", res => {
      result = JSON.parse(res);
    })
    return result;
  }



}


