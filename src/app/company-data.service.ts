import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

const options = {
      headers: new HttpHeaders({ "Content-Type":"application/json"})
}

@Injectable({
  providedIn: 'root'
})
export class CompanyDataService {
  ticker:string = '';
  buffered_description:boolean = false;
  buffered_peers=false;
  buffered_news=false;
  buffered_sentiment = false;
  buffered_recommendation = false;
  buffered_earnings = false;

  comp_description;
  comp_latest;
  comp_peers;
  comp_news;
  comp_history;
  comp_sentiment;
  comp_recommendation;
  comp_earnings;

  comp_description_buffer;

  constructor(private http : HttpClient) { }

  setTicker(t: string) {
    if(t != this.ticker){
      this.ticker = t;
      this.buffered_description = false;
      this.buffered_peers = false;
      this.buffered_news = false;
      this.buffered_sentiment = false;
      this.buffered_recommendation = false;
      this.buffered_earnings = false;
    }
  }

  getTicker(){
    return this.ticker;
  }

  getAutoComplete(txt: string){
    return this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/auto_complete/' + txt);
  }


  getCompDescription(){
    console.log('buffered_description:' + this.buffered_description);
    if (!this.buffered_description){
      this.comp_description = this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_description/' + this.ticker);
      this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_description/' + this.ticker).subscribe(response=>{
        this.comp_description_buffer = response;
        this.buffered_description = true;
      });
      
    }
    return this.comp_description;
  }
// comp_earnings
  getEarnings(){
    console.log('buffered_earnings:' + this.buffered_earnings);
    if (!this.buffered_earnings){
      this.comp_earnings = this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_earnings/' + this.ticker);
      this.buffered_earnings = true;
    }
    return this.comp_earnings;
  }

  getCD(txt){
    return this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_description/' + txt);
  }

  getCL(txt){
    return this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_latest/' + txt);
  }

  getCompLatest(){
    this.comp_latest = this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_latest/' + this.ticker);
    return this.comp_latest;
  }

  getSentiment(){
    console.log('buffered_sentiment:' + this.buffered_sentiment);
    if (!this.buffered_sentiment){
      this.comp_sentiment = this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_sentiment/' + this.ticker);
      this.buffered_sentiment = true;
    }
    return this.comp_sentiment;
  }

  getRecommendation(){
    console.log('buffered_recommendation:' + this.buffered_recommendation);
    if (!this.buffered_recommendation){
      this.comp_recommendation = this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_recommendation/' + this.ticker);
      this.buffered_recommendation = true;
    }
    return this.comp_recommendation;
  }

  getHistory(resol, from, to){
    this.comp_history = this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_history/' + this.ticker + '/' + resol + '/' + from +'/' + to);
    return this.comp_history;
  }

  getPeers(){
    console.log('buffered_peers:' + this.buffered_peers);
    if (!this.buffered_peers){
      this.comp_peers = this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_peers/' + this.ticker);
      this.buffered_peers = true;
    }
    return this.comp_peers;
  }

  getNews(){
    console.log('buffered_news:' + this.buffered_news);
    if (!this.buffered_news){
      let today = new Date();
      let week_ago = new Date();
      week_ago.setDate(week_ago.getDate() - 7);
      var year1 = week_ago.getFullYear();
      var month1 = week_ago.getMonth()+1;
      var date1 = week_ago.getDate();
      var year2 = today.getFullYear();
      var month2 = today.getMonth()+1;
      var date2 = today.getDate();
      var from = year1 + '-' + (month1>9 ? '' : '0') + month1 + '-' + (date1>9 ? '' : '0') + date1;
      var to = year2 + '-' + (month2>9 ? '' : '0') + month2 + '-' + (date2>9 ? '' : '0') + date2;
      this.comp_news = this.http.get('https://stock-search-backend-346009.wl.r.appspot.com/comp_news/' + this.ticker + '/' + from + '/' + to);
      this.buffered_news = true;
    }
    return this.comp_news;
  }

}
