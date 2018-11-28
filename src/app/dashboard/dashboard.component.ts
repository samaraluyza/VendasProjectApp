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
  urlProd = "https://production-api.azurewebsites.net/api/";


  listaFuncionarios: any[];
  listaVendas: any[];
  ngOnInit(): void {
    this.listaFuncionarios = [];
    this.listaVendas = [];
    this.listaVendas = this.getVendas();
    this.listaFuncionarios = this.getFuncionarios();
    this.montarRelatorio1();
  }

  montarRelatorio1(){
    var funci = [];
    this.listaFuncionarios.forEach(F => {
      if (F.Cargo == "Vendedor" && funci.length < 2)
        funci.push(F);
    });
    var funciProntos = [];
    var listaDrilldown = [];
    funci.forEach((fp, index) => {
      var vendas = this.listaVendas.filter(function (v) {
        return v.idFuncionario == fp.Matricula
      });
      var totalQuantidadeVendidaOtimo = 0;
      var totalQuantidadeVendidaBom = 0;
      var totalQuantidadeVendidaMedio = 0;
      var totalQuantidadeVendidaRuim = 0;

      var preco = this.getValorProduto();
      vendas.forEach(v => {
        switch (v.qualidade) {
          case 1:
          case 2:
            break;

          case 3:
          case 4:
            totalQuantidadeVendidaRuim += parseFloat((v.quantidade * preco).toFixed(2));
            break;

          case 5:
          case 6:
            totalQuantidadeVendidaMedio += parseFloat((v.quantidade * preco).toFixed(2));
            break;

          case 7:
          case 8:
            totalQuantidadeVendidaBom += parseFloat((v.quantidade * preco).toFixed(2));
            break;

          case 9:
          case 10:
            totalQuantidadeVendidaOtimo += parseFloat((v.quantidade * preco).toFixed(2));
            break;
        }
      });

      var fvm = new FuncionarioVendasViewModel();
      fvm.name = fp.Nome;
      fvm.y = parseFloat((totalQuantidadeVendidaBom +
        totalQuantidadeVendidaMedio +
        totalQuantidadeVendidaOtimo +
        totalQuantidadeVendidaRuim).toFixed(2));
      var dd = new SerieDrilldownViewModel();
      dd.id = "total" + fvm.name.trim();
      fvm.drilldown = dd.id;
      dd.colorByPoint = true;
      dd.name = "Tipos Coque x Valor"

      if (totalQuantidadeVendidaOtimo > 0)
        dd.data.push(CoqueValor.returnCoqueValor("Ótimo", totalQuantidadeVendidaOtimo));
      if (totalQuantidadeVendidaBom > 0)
        dd.data.push(CoqueValor.returnCoqueValor("Bom", totalQuantidadeVendidaBom));
      if (totalQuantidadeVendidaMedio > 0)
        dd.data.push(CoqueValor.returnCoqueValor("Médio", totalQuantidadeVendidaMedio));
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
        }],
        drilldown: {
          series: listaDrilldown
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

  getVendas(): any {
    var result;
    this.httpGet(this.urlMV + "Vendas", res => {
      result = JSON.parse(res);
    })
    return result;
  }

  getValorProduto() {
    var result;
    this.httpGet(this.urlFinanceiro + "Produto", res => {
      result = JSON.parse(res);
    })
    var prod = result.filter(function (p) {
      //TODO pegar da api de produção o produto a ser vendido
      return p.id == 2
    });;
    return prod[0].preco;
  }



}


