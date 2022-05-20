import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyDataService } from '../company-data.service';
import { FormControl } from '@angular/forms';
import { ModalDismissReasons, NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import { debounceTime} from 'rxjs/operators';
import { Subject, interval, Subscription} from 'rxjs';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  error_message = "Currently you don't have any stock in your watchlist.";
  display_error = true;
  isloading = true;
  watch_list:Object[] = [];
  storage;
  constructor(private route: ActivatedRoute, private router: Router, private service : CompanyDataService, private modalService: NgbModal) { }

  ngOnInit(): void {

    this.storage = window['localStorage'];
    for(var i =0; i < this.storage.length; ++i){
        let key = this.storage.key(i);
        // console.log(key);
        let options = key.split('_');
        let ticker = options[0];
        let op = options[1];
        if (op == 'a'){
          let watch_list_index = this.watch_list.length;
          this.watch_list.push({'ticker':ticker});
          this.service.getCD(ticker).subscribe((response) => {
            this.watch_list[watch_list_index] = Object.assign({},this.watch_list[watch_list_index],response);
            // console.log(this.watch_list);
            this.isloading = false;
          });
          this.service.getCL(ticker).subscribe((response)=>{
            this.watch_list[watch_list_index] = Object.assign({},this.watch_list[watch_list_index],response);
            this.isloading = false;
          });
        }
     }
     if(!this.watch_list.length){
      this.isloading = false;
     }
    }
  close = (ticker)=>{
    let i = this.watch_list.indexOf(ticker);
    this.dearchive(ticker['ticker'] + '_a');
    // console.log(this.storage);
    this.watch_list.splice(i, 1);
  }

  getColor = (num)=>{
    if(num>0)return 'green';
    else if(num<0)return 'red';
    return 'black';
  }

  getDate = (unix_timestamp) => {

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

  roundNum = (num: number) => {
    if(num){
      return num.toFixed(2);
    }
    return '0.00';
  }

  dearchive=(ticker)=>{
    this.storage.removeItem(ticker);
  }

  go= (event)=>{
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var value = idAttr.nodeValue;
    var id = parseInt(value.split('_')[1]);
    this.router.navigate(['../ticker/'+ this.watch_list[id]['ticker']], {relativeTo: this.route})
  }
}
