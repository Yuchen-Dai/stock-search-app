import { Component, OnInit, ViewChild, Input, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyDataService } from '../company-data.service';
import { FormControl } from '@angular/forms';
import { ModalDismissReasons, NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import { debounceTime} from 'rxjs/operators';
import { Subject, interval, Subscription} from 'rxjs';
import * as Highcharts from 'highcharts/highstock';
import IndicatorsCore from "highcharts/indicators/indicators";
import vbp from "highcharts/indicators/volume-by-price";

IndicatorsCore(Highcharts);
vbp(Highcharts);

@Component({
  selector: 'ngbd-modal-content',
  template: `
    
    <div class="modal-header" style = "white-space: pre">
      <div class="modal-title"><h1 style="font-weight: bold">{{this.source}}</h1>{{this.datetime}}</div>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <h3 style="font-weight: bold">{{headline}}</h3>
      <p>{{summary}}</p>
      <p style= "color: grey">For more detail click <a [href] = "this.url" target="_blank" style="text-decoration: none;">here</a></p>
    </div>
    <div class="modal-footer" style="float:left;">
      <div><h3>Share</h3>
        <div>
          <a style="text-decoration: none;" class="twitter-share-button" href="https://twitter.com/intent/tweet?text={{this.headline}}&amp;url={{this.url}}" target="_blank" data-size="large">Tweet</a>
        </div>
        <div class="fb-share-button" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button" data-size="small">
          <a style="text-decoration: none;" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u={{this.url}}" class="fb-xfbml-parse-ignore">Facebook</a>
        </div>
      </div>
    </div>
  `
})
export class NgbdModalContent {
  @Input() source;
  @Input() datetime;
  @Input() headline;
  @Input() summary;
  @Input() url;
  constructor(public activeModal: NgbActiveModal) {}
}




@Component({
  selector: 'ngbd-modal-content',
  template: `
    
    <div class="modal-header" style = "white-space: pre">
      <div class="modal-title"><h1 style="font-weight: bold">{{this.ticker}}</h1></div>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <form>
        <p>Current Price: {{current.toFixed(2)}}</p>
        <p>Money in Wallet: \${{money.toFixed(2)}}</p>
        <div class = 'row row-cols-2'>
          <div class = 'col-2 d-flex justify-content-center'>Quantity</div>
          <div class = 'col-6'>
            <input class="form-control" id="quantity" value = "0">
          </div>
        </div>
        <small [hidden]="hide" style="color: red">Not enough money in wallet!</small>
      </form>
    </div>
    <div class="modal-footer">
      <div class = "me-auto">Total: {{total.toFixed(2)}}</div>
      <button class = 'btn btn-success' (click)="bb($event)" [disabled] = !hide>Buy</button>
    </div>
  `
})
export class BuyContent {
  @Input() ticker;
  @Input() current;
  @Input() money;
  hide = true;
  total = 0;
  disable = false;
  num_stocks = 0;
  storage;
  public event: EventEmitter<any> = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {}
  ngOnInit():void{
    document.getElementById('quantity')!.addEventListener('input', this.b);
    this.storage = window['localStorage'];
  }
  b = (event)=>{
    let q = event.target.value;
    if(isNaN(q) || !q || q.includes('.')){
      this.hide = false;
    }
    else{
      q = parseInt(q);
      let total = this.current * q;
      if(total > this.money){
        this.hide = false;
      }
      else{
        this.num_stocks = q;
        this.total = total;
        this.hide = true;
      }
    }
  }
  getPort = ()=>{
    let port = this.storage['portfolio_p'];
    if(port){

      port = JSON.parse(port);
      return port;
    }
    else{
      port = {'money':25000, 'stocks':{}, 'price':{}};
      this.storage['portfolio_p'] = JSON.stringify(port);
      return port;
    }
  }

  setPort = (port)=>{
    this.storage['portfolio_p'] = JSON.stringify(port);
  }

  bb = (event)=>{
    let p = this.getPort();
    if(p['stocks'][this.ticker]){
      p['stocks'][this.ticker] = p['stocks'][this.ticker] + this.num_stocks;
      p['price'][this.ticker] = p['price'][this.ticker] + this.total;
    }
    else{
      p['stocks'][this.ticker] = this.num_stocks;
      p['price'][this.ticker] = this.total;
    }
    p['money'] = p['money'] - this.total;
    this.setPort(p);
    this.event.emit(this.ticker);
    this.activeModal.close('buy');
  }
}




@Component({
  selector: 'ngbd-modal-content',
  template: `
    
    <div class="modal-header" style = "white-space: pre">
      <div class="modal-title"><h1 style="font-weight: bold">{{this.ticker}}</h1></div>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <form>
        <p>Current Price: {{current.toFixed(2)}}</p>
        <p>Money in Wallet: \${{money.toFixed(2)}}</p>
        <div class = 'row row-cols-2'>
          <div class = 'col-2 d-flex justify-content-center'>Quantity</div>
          <div class = 'col-6'>
            <input class="form-control" id="quantity" value = "0">
          </div>
        </div>
        <small [hidden]="hide" style="color: red">Not enough money in wallet!</small>
      </form>
    </div>
    <div class="modal-footer">
      <div class = "me-auto">Total: {{total.toFixed(2)}}</div>
      <button class = 'btn btn-success' (click)="bb($event)" [disabled] = !hide>Sell</button>
    </div>
  `
})
export class SellContent {
  @Input() ticker;
  @Input() current;
  @Input() money;
  hide = true;
  total = 0;
  disable = false;
  num_stocks = 0;
  storage;
  public event: EventEmitter<any> = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {}
  ngOnInit():void{
    document.getElementById('quantity')!.addEventListener('input', this.b);
    this.storage = window['localStorage'];
  }

  b = (event)=>{
    let q = event.target.value;
    if(isNaN(q) || !q || q.includes('.')){
      this.hide = false;
    }
    else{
      q = parseInt(q);
      let p = this.getPort();
      let c_stock = 0;
      if (p['stocks'][this.ticker]){
        c_stock = p['stocks'][this.ticker];
      }
      if(c_stock >= q){
        this.num_stocks = q;
        this.hide = true;
        this.total = q * this.current;
      }
      else{
        this.hide=false;
      }

    }
  }
  getPort = ()=>{
    let port = this.storage['portfolio_p'];
    if(port){

      port = JSON.parse(port);
      return port;
    }
    else{
      port = {'money':25000, 'stocks':{}, 'price':{}};
      this.storage['portfolio_p'] = JSON.stringify(port);
      return port;
    }
  }

  setPort = (port)=>{
    this.storage['portfolio_p'] = JSON.stringify(port);
  }

  bb = (event)=>{
    let p = this.getPort();
    if(p['stocks'][this.ticker] != this.num_stocks){
      p['stocks'][this.ticker] = p['stocks'][this.ticker] - this.num_stocks;
      p['price'][this.ticker] = p['price'][this.ticker] - this.total;
    }
    else{
      delete p['stocks'][this.ticker];
      delete p['price'][this.ticker];
    }
    p['money'] = p['money'] + this.total;
    this.setPort(p);
    this.event.emit(this.ticker);
    this.activeModal.close('sell');
  }
}






@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit {

  private _success = new Subject<string>();
  subscription: Subscription;

  fc: FormControl = new FormControl();
  loading: boolean = false;
  inputTxt: string = '';
  autoTxt: any;
  ticker;
  storage;
  num_stocks = 0;


  loading_content = false;
  display_content: boolean = false;
  display_error = false;
  error_message = 'No data found. Please enter a valid Ticker';
  error_dismissible = false;
  isArchive = false;

  alert_close: boolean = false;
  market_open = false;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert;
  danger_message = '';
  success_message = '';
  

  comp_description;
  comp_latest = {"c":0,"d":0,"dp":0,"h":0,"l":0,"o":0,"pc":0,"t":0};
  comp_peers = [];
  comp_news = [];
  comp_history = [];
  comp_sentiment = {"reddit": [
    {
      "atTime": "2021-05-23 03:00:00",
      "mention": 0,
      "positiveScore": 0,
      "negativeScore": 0,
      "positiveMention": 0,
      "negativeMention": 0,
      "score": 0
    }
  ],
  "symbol": " ",
  "twitter": [
    {
      "atTime": "2021-05-23 03:00:00",
      "mention": 0,
      "positiveScore": 0,
      "negativeScore": 0,
      "positiveMention": 0,
      "negativeMention": 0,
      "score": 0
    }
  ]};
  comp_recommendation = [
    {
      "buy": 0,
      "hold": 0,
      "period": "2020-03-01",
      "sell": 0,
      "strongBuy": 0,
      "strongSell": 0,
      "symbol": ""
    },
    {
      "buy": 17,
      "hold": 13,
      "period": "2020-02-01",
      "sell": 5,
      "strongBuy": 13,
      "strongSell": 0,
      "symbol": ""
    }
  ]
  comp_earnings = [
    {
      "actual": 0,
      "estimate": 0,
      "period": "2019-03-31",
      "symbol": ""
    },
    {
      "actual": 0,
      "estimate": 0,
      "period": "2018-12-31",
      "symbol": ""
    },
    {
      "actual": 0,
      "estimate": 0,
      "period": "2018-09-30",
      "symbol": ""
    },
    {
      "actual": 0,
      "estimate": 0,
      "period": "2018-06-30",
      "symbol": ""
    }
  ]

  Highcharts: typeof Highcharts = Highcharts; // required
  chartConstructor: string = 'stockChart'; // optional string, defaults to 'chart'
  chartConstructor2: string = 'chart';
  chartOptions: Highcharts.Options = {
    series: [{
      data: [1, 2, 3],
      type: 'line'
    }]
  };
  chartOptions2: Highcharts.Options = {
    series: [{
      data: [1, 2, 3],
      type: 'line'
    }]
  };
  chartOptions3: Highcharts.Options = {
    series: [{
      data: [1, 2, 3],
      type: 'line'
    }]
  };
  chartOptions4: Highcharts.Options = {
    series: [{
      data: [1, 2, 3],
      type: 'line'
    }]
  };
  chartCallback: Highcharts.ChartCallbackFunction = function (chart) {} // optional function, defaults to null
  updateFlag: boolean = false; // optional boolean
  updateFlag2: boolean = false;
  updateFlag3: boolean = false;
  updateFlag4: boolean = false;
  oneToOneFlag: boolean = true; // optional boolean, defaults to false
  runOutsideAngularFlag: boolean = false; // optional boolean, defaults to false


  constructor(private route: ActivatedRoute, private router: Router, private service : CompanyDataService, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.storage = window['localStorage'];
    let ticker_url = this.route.snapshot.params['ticker'];
    if (!ticker_url&&this.service.getTicker()){
      this.router.navigate(['../../ticker/'+this.service.getTicker()], {relativeTo: this.route})
      return;
    }
    else if (ticker_url){
      this.ticker = ticker_url.toUpperCase();
      this.service.setTicker(ticker_url);
    }

    document.getElementById('ticker')!.addEventListener('input', this.autoComplete);
    this._success.subscribe(message => {
      let option = message.split(" ")[0];
      let m = message.split(" ").slice(1).join(" ");
      if (option == 'danger')this.danger_message = m;
      else if (option == 'success')this.success_message = m;
    });
    this._success.pipe(debounceTime(5000)).subscribe(() => {
      if (this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
    });
    // this._success.next('danger ' + this.comp_description["ticker"] + ' removed from Watchlist.');

    if (this.ticker){
      this.draw_company();
    }

  }

  ngOnDestroy() {
    if(this.subscription)this.subscription.unsubscribe();
  }

  draw_company = () => {
    this.display_content = false;
    this.display_error = false;
    this.loading_content = true;
    if (this.service.buffered_description){
      let response = this.service.comp_description_buffer;
      let len = Object.keys(response).length;
      if (len > 0){
        this.comp_description = response;
        this.loading_content = false;
        this.display_content = true;
      }
      else{
        this.loading_content = false;
        this.display_error = true;
        this.error_message = 'No data found. Please enter a valid Ticker';
        this.error_dismissible = false;
      }
    }
    else{
      this.service.getCompDescription().subscribe((response) => {
        let len = Object.keys(response).length;
        if (len > 0){
          this.comp_description = response;
          this.loading_content = false;
          this.display_content = true;
        }
        else{
          this.loading_content = false;
          this.display_error = true;
          this.error_message = 'No data found. Please enter a valid Ticker';
          this.error_dismissible = false;
        }
      });
    }


    const source = interval(15000);
    this.updateLatest(false);
    this.subscription = source.subscribe(() => this.updateLatest(true));
    this.service.getPeers().subscribe((response)=> {
      this.comp_peers = response;
    })

    this.service.getNews().subscribe((response)=>{
      let news = response;
      var len = news.length;
      if (!len){
        return;
      }
      for(var i=0; i<len; i++) {
        if(!news[i]['image']) {
          news.splice(i, 1);
          i--;
          len--;
        }
      }
      this.comp_news = news.splice(0,20);
    });

    this.service.getSentiment().subscribe((response)=>{
      if(!response.length){
        return;
      }
      this.comp_sentiment = response;
    });

    this.update_sell();
    this.update_chart3();
    this.update_chart4();
    // console.log('storage ' + this.storage[this.ticker+'_a'])
    this.isArchive = this.storage[this.ticker+'_a'] == 'true' ? true : false;

  }
  getActual = (response)=>{
    let result: any[] = [];
    for(let i = 0; i < 4; ++i){
      let actual = this.avoidZero(response[i]['actual']);
      let estimate = this.avoidZero(response[i]['estimate']);
      // let y = response[i]['period'] + '\nSurprise:' + ((actual - estimate) / estimate).toFixed(4);
      result.push([i*2,actual]);
    }
    return result;
  }

  getEstimate = (response)=>{
    let result: any[] = [];
    for(let i = 0; i < 4; ++i){
      let actual = this.avoidZero(response[i]['actual']);
      let estimate = this.avoidZero(response[i]['estimate']);
      // let y = response[i]['period'] + '\nSurprise:' + ((actual - estimate) / estimate).toFixed(4);
      result.push([i*2,estimate]);
    }
    return result;
  }

  getX = (response)=>{
    let result: any[] = [];
    for(let i = 0; i < 4; ++i){
      let actual = this.avoidZero(response[i]['actual']);
      let estimate = this.avoidZero(response[i]['estimate']);
      result.push( response[i]['period'] + '<br>Surprise:' + ((actual - estimate) / estimate).toFixed(4));
      result.push( '');
    }
    return result;
  }

  update_chart4 = () => {
    this.service.getEarnings().subscribe((response)=>{
      if(!response.length){
        return;
      }
      let x = this.getX(response);
      this.chartOptions4 = {
        title: {
            text: 'Historical' + this.ticker + "Surprises"
        },

        yAxis: {
          title: {
              text: 'Quaterly EPS'
          },

        },

        xAxis: {
          labels: {
            formatter: (res)=>{
              return x[res.value];
            }
          }
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },  

        series: [{
            name: 'Actual',
            type: 'spline',
            data: this.getActual(response)
        }, {
            name: 'Estimate',
            type: 'spline',
            data: this.getEstimate(response)
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    };
      this.updateFlag4 = true;
    });

  }


  update_chart3 = () => {
    this.service.getRecommendation().subscribe((response)=>{
      if (!response.length){
        return;
      }
      let r = this.getRec(response);
      this.chartOptions3 = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Recommendation Trends'
        },
        xAxis: {
            categories: this.getCategory(response)
        },
        yAxis: {
            min: 0,
            title: {
                text: '#Analysis'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: 'gray'
                }
            }
        },
        legend: {
            align: 'right',
            x: -30,
            verticalAlign: 'top',
            y: 25,
            floating: true,
            backgroundColor: 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            name: 'Strong Buy',
            type: 'column',
            data: r[0]
        }, {
            name: 'Buy',
            type: 'column',
            data: r[1]
        }, {
            name: 'Hold',
            type: 'column',
            data: r[2]
        }, {
            name: 'Sell',
            type: 'column',
            data: r[3]
        }, {
            name: 'Strong Sell',
            type: 'column',
            data: r[4]
        }]
    };
      this.updateFlag3 = true;
    });
  }

  getRec = (response) => {
    let result:any[] = [[],[],[],[],[]];
    for(let i = 0; i < response.length; ++i){
      result[0].push(response[i]['strongBuy']);
      result[1].push(response[i]['buy']);
      result[2].push(response[i]['hold']);
      result[3].push(response[i]['sell']);
      result[4].push(response[i]['strongSell']);
    }
    return result;
  }

  getCategory = (response) => {
    let result:any[] = [];
    for(let i = 0; i < response.length; ++i){
      result.push(response[i]['period']);
    }
    return result;
  }



  update_sell = () => {
    let p = this.getPort();
    this.num_stocks = parseInt(p['stocks'][this.ticker]);
  }

  updateLatest = (isDailyUpdate) => {
    this.service.getCompLatest().subscribe((response) => {
      console.log('updating...');
      this.comp_latest = response; 
      let to = response['t'];
      let from = to - 21600;

      // draw today history graph
      this.service.getHistory(5, from, to).subscribe((response2) => {
        if (!response2['t'] || !response2['t'].length){
          return;
        }
        // console.log(response2);
        this.chartOptions = {
          title: {
            text: this.ticker + ' Hourly Price Variation',
            style: {
              color: 'grey'
            }
          },
          time: {
            useUTC: false
          },
              
          series: [{
            name: this.ticker,
            showInLegend: false,
            data: this.zip_response(response2['t'], response2['o']),
            type: 'line',
            color: this.getColor()
          }],
          xAxis: {
            type: 'datetime',
            units: [['minute',[30]],['hour',[1]]],
            crosshair: true
          },
          yAxis: [{
            title: {text: ''},
            opposite: true,
            height: '100%',
            offset: 0
          }],
          plotOptions: {
            series: {
              pointPlacement: 'on'
            }
          },
          navigator: {
            enabled: false
          },
          rangeSelector: {
              enabled: false
          },
        };
        this.updateFlag = true;
      });

      if (isDailyUpdate){
        return;
      }
      // draw charts on third tab
      from = to - 63072000;
      this.service.getHistory('D', from, to).subscribe((response2) => {
        if (!response2['t'] || !response2['t'].length){
          return;
        }
        let ohlc = this.getOHLC(response2);
        let volume = this.getVolume(response2);
        // console.log(ohlc);
        // console.log(volume);

        this.chartOptions2 = {

          rangeSelector: {
              selected: 2
          },

          title: {
              text: this.ticker + ' Historical'
          },

          subtitle: {
              text: 'With SMA and Volume by Price technical indicators'
          },

          yAxis: [{
              startOnTick: false,
              endOnTick: false,
              labels: {
                  align: 'right',
                  x: -3
              },
              title: {
                  text: 'OHLC'
              },
              height: '60%',
              lineWidth: 2,
              resize: {
                  enabled: true
              }
          }, {
              labels: {
                  align: 'right',
                  x: -3
              },
              title: {
                  text: 'Volume'
              },
              top: '65%',
              height: '35%',
              offset: 0,
              lineWidth: 2
          }],

          tooltip: {
              split: true
          },

          // plotOptions: {
          //     series: {
          //         dataGrouping: {
          //             units:  [[
          //                   'week', 
          //                   [1]
          //               ], [
          //                   'month',
          //                   [1, 2, 3, 4, 6]
          //               ]]
          //         }
          //     }
          // },

          series: [{
              type: 'candlestick',
              name: 'AAPL',
              id: 'aapl',
              zIndex: 2,
              data: ohlc
          }, {
              type: 'column',
              name: 'Volume',
              id: 'volume',
              data: volume,
              yAxis: 1
          }, {
              type: 'vbp',
              linkedTo: 'aapl',
              params: {
                  volumeSeriesID: 'volume'
              },
              dataLabels: {
                  enabled: false
              },
              zoneLines: {
                  enabled: false
              }
          }, {
              type: 'sma',
              linkedTo: 'aapl',
              zIndex: 1,
              marker: {
                  enabled: false
              }
          }]
      };
        this.updateFlag2 = true;
      });


    });
  }

  getOHLC = (response)=>{
    let t = response['t'];
    let o = response['o'];
    let h = response['h'];
    let l = response['l'];
    let c = response['c'];

    let ohlc:any[] = [];

    for(let i = 0; i < t.length; ++i){
      ohlc.push([t[i]*1000,o[i],h[i],l[i],c[i]]);
    }

    return ohlc;
  }

  getVolume = (response)=>{
    let t = response['t'];
    let v = response['v'];
    let volume:any[] = [];
    for(let i = 0; i < t.length; ++i){
      volume.push([t[i]*1000,v[i]]);
    }
    return volume;
  }

  zip_response = (a, b)=>{
    let result:any[] = [];
    for(let i = 0; i < a.length; ++i){
      result.push([a[i]*1000, b[i]]);
    }
    return result;

  }

  switch_archive = (ticker)=>{
    if(this.isArchive){
      this.isArchive = false;
      this._success.next('danger ' + this.comp_description["ticker"] + ' removed from Watchlist.');
      this.storage.removeItem([this.ticker+'_a']);
    }
    else{
      this.isArchive = true;
      this._success.next('success ' + this.comp_description["ticker"] + ' added to Watchlist.');
      this.storage[this.ticker+'_a'] = this.isArchive;
    }
  }


  closeAlert(id) {
    this.alert_close = true;
    document.getElementById(id)!.style.display = "none";
  }

  getColor= ()=> {
    if(this.comp_latest['d']>0)return 'green';
    else if(this.comp_latest['d']<0)return 'red';
    return 'black';
  }

  getMarketStatus(){
    let today = new Date();
    let market_date = new Date(this.comp_latest['t']*1000);

    let dif = today.getTime() - market_date.getTime();
    if (dif > 300000){
      this.market_open = false;
      return "Market Closed on " + this.getDate(this.comp_latest['t']);
    }
    else{
      this.market_open = true;
      return "Market is Open";
    }
  }

  getStatusColor(){
    if (this.market_open)return 'green';
    return 'red';
  }

  onSubmit(event: Event){
    event.preventDefault();
    var ticker = (<HTMLInputElement>document.getElementById('ticker'))!.value.toUpperCase();
    if(!ticker){
      this.display_error = true;
      this.error_message = 'Please enter a valid ticker';
      this.error_dismissible = true;
    }
    else{
      this.service.setTicker(ticker);
      this.router.navigate(['../../ticker/' + ticker], {relativeTo: this.route});
    }
  }

  clear(event: Event){
    event.preventDefault();
    this.ticker = '';
    this.display_content = false;
    this.service.setTicker("");
    this.router.navigate(['../../ticker/home'], {relativeTo: this.route})
  }

  roundNum = (num: number) => {
    if(num){
      return num.toFixed(2);
    }
    return '0.00';
  }

  avoidZero = (num)=> {
    if(num){
      return num;
    }
    return 0;
  }

  getDate = (unix_timestamp) => {
    // let unix_timestamp = this.comp_latest['t'];
    var a = new Date(unix_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth()+1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  autoComplete = (event: any) => {
    this.loading = true;
    this.autoTxt = null;
    var options;
    this.inputTxt = event.target.value.toUpperCase();
    if (this.inputTxt !== '') {
      this.service.getAutoComplete(this.inputTxt).subscribe((response) => {
        if (response['count']){
          this.autoTxt = response['result'];
          var len = this.autoTxt.length;
          for(var i=0; i<len; i++) {
            if(this.autoTxt[i]['symbol'].indexOf(".") != -1) {
              this.autoTxt.splice(i, 1);
              i--;
              len--;
            }
          }
          this.loading = false;
        }
      } );
    }
  }

  getPort = ()=>{
    let port = this.storage['portfolio_p'];
    if(port){

      port = JSON.parse(port);
      return port;
    }
    else{
      port = {'money':25000, 'stocks':{}, 'price':{}};
      this.storage['portfolio_p'] = JSON.stringify(port);
      return port;
    }
  }


  openModal= (event)=>{
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var value = idAttr.nodeValue;
    var id = parseInt(value.split('_')[1]);

    const modalRef = this.modalService.open(NgbdModalContent);

    modalRef.componentInstance.source = this.comp_news[id]['source'];
    modalRef.componentInstance.datetime = this.getDate(this.comp_news[id]['datetime']);
    modalRef.componentInstance.headline = this.comp_news[id]['headline'];
    modalRef.componentInstance.summary = this.comp_news[id]['summary'];
    modalRef.componentInstance.url = this.comp_news[id]['url'];
  }

  buy = (ticker)=>{
    const modalRef = this.modalService.open(BuyContent);

    modalRef.componentInstance.ticker = this.ticker;
    modalRef.componentInstance.current = this.comp_latest['c'];
    modalRef.componentInstance.money = this.getPort()['money'];

    modalRef.componentInstance.event.subscribe(res=>{
      this._success.next('success ' + res + ' bought successfully.');
      this.update_sell();
    })
  }

  sell = (ticker)=>{
    const modalRef = this.modalService.open(SellContent);
    modalRef.componentInstance.ticker = this.ticker;
    modalRef.componentInstance.current = this.comp_latest['c'];
    modalRef.componentInstance.money = this.getPort()['money'];

    modalRef.componentInstance.event.subscribe(res=>{
      this._success.next('danger ' + res + ' sold successfully.');
      this.update_sell();
    })
  }

}
