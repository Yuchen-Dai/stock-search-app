import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyDataService } from './company-data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Stock Search';
  flag_search = false;
  flag_watchlist = false;
  flag_portfolio = false;
  color_active = 'white';
  color_deactive = 'grey';
  ticker = '';
  constructor(private route: ActivatedRoute, private router: Router, public service : CompanyDataService){}
  // ngOnInit(): void {
  //   this.updateTicker();
  // }
  toRoute(name: string, event: Event){
    event.preventDefault();
    this.updateTicker();

    if(name == ''){
      this.flag_watchlist = false
      this.flag_search = true
      this.flag_portfolio = false
    }
    else if(name == 'watchlist'){
      this.flag_watchlist = true
      this.flag_search = false
      this.flag_portfolio = false
    }
    else if(name == 'portfolio'){
      this.flag_watchlist = false
      this.flag_search = false
      this.flag_portfolio = true
    }

    this.router.navigate([name], {relativeTo: this.route});
  }

  updateTicker = ()=>{
    this.ticker = this.service.ticker;
  }  
}
