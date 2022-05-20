import { Component, OnInit, ViewChild, Input, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyDataService } from '../company-data.service';
import { FormControl } from '@angular/forms';
import { ModalDismissReasons, NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import { debounceTime} from 'rxjs/operators';
import { Subject, interval, Subscription} from 'rxjs';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import * as more from 'highcharts/highcharts-more.src';
import * as exporting from 'highcharts/modules/exporting.src';



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
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  private _success = new Subject<string>();
  money = 25000;
  successMessage = '';
  error_message = "Currently you don't have any stock.";
  display_error = true;
  isloading = false;
  port;
  watch_list:Object[] = [];
  storage;
  danger_message = '';
  success_message = '';

  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert;

  constructor(private route: ActivatedRoute, private router: Router, private service : CompanyDataService, private modalService: NgbModal) { }
  ngOnInit(): void {
    this.storage = window['localStorage']

    this.update_sell();
    this.update_money(); 
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

  update_money(){
    let q = this.getPort();
    this.money = q['money'];
  }

  go= (event)=>{
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var value = idAttr.nodeValue;
    var id = parseInt(value.split('_')[1]);
    this.router.navigate(['../ticker/'+ this.watch_list[id]['ticker']], {relativeTo: this.route})
  }

  getChange = (i)=>{
    let ticker = this.watch_list[i]['ticker'];
    let c_price = this.roundNumber(this.watch_list[i]['c']);
    if (!c_price){
      return 0;
    }
    let b_price = this.port['price'][ticker] / this.port['stocks'][ticker]
    return (c_price - b_price) / b_price;
  }

  getStatusColor = (i)=>{
    let change = this.getChange(i);
    if(change > 0){
      return 'green';
    }
    else if (change < 0){
      return 'red';
    }
    return 'black';
  }

  roundNum = (num: number) => {
    if(num){
      return num.toFixed(2);
    }
    return '0.00';
  }

  roundNumber = (num: number) => {
    if(num){
      return num;
    }
    return 0;
  }


  buy = (i)=>{
    let ticker = this.watch_list[i]['ticker'];
    let current = this.watch_list[i]['c'];

    const modalRef = this.modalService.open(BuyContent);

    modalRef.componentInstance.ticker = ticker;
    modalRef.componentInstance.current = current;
    modalRef.componentInstance.money = this.getPort()['money'];

    modalRef.componentInstance.event.subscribe(res=>{
      this._success.next('success ' + res + ' bought successfully.');
      this.update_sell();
      this.update_money();
    })
  }

  sell = (i)=>{
    let ticker = this.watch_list[i]['ticker'];
    let current = this.watch_list[i]['c'];

    const modalRef = this.modalService.open(SellContent);
    modalRef.componentInstance.ticker = ticker;
    modalRef.componentInstance.current = current;
    modalRef.componentInstance.money = this.getPort()['money'];

    modalRef.componentInstance.event.subscribe(res=>{
      this._success.next('danger ' + res + ' sold successfully.');
      this.update_sell();
      this.update_money();
    })
  }

  update_sell = ()=>{
    this.isloading = true;
    this.port = this.getPort();
    let temp = Object.keys(this.port['stocks']);
    this.watch_list = [];
    for(let i = 0; i < temp.length; ++i){
      let ticker = temp[i];
      this.watch_list.push({'ticker':ticker});
      this.service.getCD(ticker).subscribe((response) => {
        this.watch_list[i] = Object.assign({},this.watch_list[i],response);
        this.isloading = false;
      });
      this.service.getCL(ticker).subscribe((response)=>{
        this.watch_list[i] = Object.assign({},this.watch_list[i],response);
        this.isloading = false;
      });
    }

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


  }


}
