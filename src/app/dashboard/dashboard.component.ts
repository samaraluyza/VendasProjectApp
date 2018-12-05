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
  META_VENDAS: 0;
  urlRH = "https://sigerh.azurewebsites.net/api/";
  urlMV = "https://sigemv.azurewebsites.net/api/";
  urlFinanceiro = "http://trabalhosige.azurewebsites.net/api/";
  urlProd = "https://sigepm.azurewebsites.net/";

  MetadeDeVendas = 460000;
  //CRIAR A LÓGICA DO RELATORIO 2
  public pbar1: PieChart;

  listaFuncionarios: any[];
  listaVendas: any[];
  ngOnInit(): void {
    this.listaFuncionarios = [];
    this.listaVendas = [];
    this.listaVendas = this.getVendas();
    this.listaFuncionarios = this.getFuncionarios();
    this.montarRelatorio1();
    this.montarRelatorio2();
  }

  montarRelatorio1() {
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
      var qualidades = this.getAllQualidades();
      var case1 = qualidades.filter(function (q) {
        return q.id_qualidade == 1
      })
      var case2 = qualidades.filter(function (q) {
        return q.id_qualidade == 2
      })
      var case3 = qualidades.filter(function (q) {
        return q.id_qualidade == 3
      })
      vendas.forEach(v => {
        switch (v.qualidade) {
          case case1[0].id_qualidade:
            totalQuantidadeVendidaOtimo += parseFloat((v.quantidade * (preco * 1.3)).toFixed(2));
            break;

          case case2[0].id_qualidade:
            totalQuantidadeVendidaBom += parseFloat((v.quantidade * (preco * 1.3)).toFixed(2));
            break;

          case case3[0].id_qualidade:
            totalQuantidadeVendidaMedio += parseFloat((v.quantidade * (preco * 1.3)).toFixed(2));
            break;
        }
      });
      totalQuantidadeVendidaBom = parseFloat(totalQuantidadeVendidaBom.toFixed(2));
      totalQuantidadeVendidaOtimo = parseFloat(totalQuantidadeVendidaOtimo.toFixed(2));
      totalQuantidadeVendidaMedio = parseFloat(totalQuantidadeVendidaMedio.toFixed(2));

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
        dd.data.push(CoqueValor.returnCoqueValor("Qualidade Ótima", totalQuantidadeVendidaOtimo));
      if (totalQuantidadeVendidaBom > 0)
        dd.data.push(CoqueValor.returnCoqueValor("Qualidade Boa", totalQuantidadeVendidaBom));
      if (totalQuantidadeVendidaMedio > 0)
        dd.data.push(CoqueValor.returnCoqueValor("Qualidade Média", totalQuantidadeVendidaMedio));
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

  montarRelatorio2() {
    var totalVendido = 0;
    var preco = this.getValorProduto();
    this.listaVendas.forEach(v => {
      totalVendido  += parseFloat((v.quantidade * (preco * 1.3)).toFixed(2))
    });

    this.pbar1 = { color: "#1ebfae", max: this.MetadeDeVendas, label: "Meta de Vendas do mês", current: totalVendido }
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

  getAllQualidades() {
    var result;
    this.httpGet(this.urlProd + "getAllQualidade", res => {
      result = JSON.parse(res);
    })
    return result
  }



}


