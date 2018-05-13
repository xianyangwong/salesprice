import { Component } from '@angular/core';
import * as XLSX from "xlsx";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "app";

  public ranges;
  public model;
  public insurance;
  public gift;
  public search ={
    type: null,
    make: "",
    gift: [],
    insurance: [],
    discount: null
  }

  public total = 0;
  public singlePrice = 0;
  public insurancePrice = 0;
  public giftPrice = 0;


  public selectedTypeId;

  constructor() {}
  selectedType(id) {
    this.selectedTypeId = id;
  }

  typeChange(){
    this.search.make = "";
  }

  onChange(){
    if(this.search.make && this.search.type){

      let gp = 1 + this.ranges[this.selectedTypeId]['毛利率'];
      let cost = 0;
      let gift=0;
      this.giftPrice = 0;
      let insuranceReturn = 0
      let insurance = [];
      this.model.forEach(element => {
        if(element["序号"]==this.search.make){
          cost = element["单车车本"];
        }
      });


      this.search.gift.forEach((element,index) => {
        if(element){
          gift +=this.gift[index]["成本价（元）"];
          this.giftPrice += this.gift[index]["售价（元）"];
        }
      });

      this.search.insurance.forEach((element,index) => {
        if(element){
          let temp = this.insurance[index]["金额"];
          if(typeof temp == "string"){
            temp = temp.replace("*车辆售价","");
          }

          insurance.push(temp)
          insuranceReturn += this.insurance[index]["返利"];
        }
      });

      let insuranceA = 0;
      let insuranceB = 0;

      insurance.forEach(element=>{
        if(typeof element == "string"){
          element = parseFloat(element) / 100.0;
          insuranceA += element
        }
        else{
          insuranceB += element
        }
      })




      /* X */
      this.total = (cost + gift + (this.search.discount - insuranceReturn))*gp

      /* A */
      this.singlePrice = (this.total - this.giftPrice - insuranceB) / (1 + insuranceA);

      /* B */
      this.insurancePrice = insuranceB + (this.singlePrice*insuranceA);


      // console.log("毛利率", gp);
      // console.log("单车成本", cost);
      // console.log("保险折扣", this.search.discount);
      // console.log("浮动保险售价", insuranceA);
      // console.log("固定保险售价", insuranceB);
      // console.log("精品成本", gift);
      // console.log("保险返利", insuranceReturn);


    }
  }

  getSelectedInsurance(){

    let temp = [];
    this.search.insurance.forEach((e,i)=>{
      if(e == true){
        temp.push(this.insurance[i])
      }
    })

    return temp;

  }

  getSelectedGift(){

    let temp = [];
    this.search.gift.forEach((e,i)=>{
      if(e == true){
        temp.push(this.gift[i])
      }
    })

    return temp;

  }

  getSelectedMake(){
    let selectedTypeObj = this.ranges[this.selectedTypeId];
    let filteredModel = this.model.filter(r => {
      if (r["车款"] == selectedTypeObj["车型"]) {
        return r;
      }
    });
    return filteredModel
  }

  getSelectedMakeDetails(){

    if(this.selectedTypeId!= null){
      let filteredModel =  this.getSelectedMake();

      let temp;

      filteredModel.forEach(m=>{
        if(m["序号"] == this.search.make){
          temp = m;
        }
      })
      return temp;
    }
    return;

  }

  ngOnInit() {
    /* set up XMLHttpRequest */
    var url =
      "http://salesprice.s3-website-ap-southeast-1.amazonaws.com/salesprice.xlsx";
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    let self = this;

    oReq.onload = function(e) {
      var arraybuffer = oReq.response;

      /* convert data to binary string */
      var data = new Uint8Array(arraybuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");

      /* Call XLSX */
      var workbook = XLSX.read(bstr, { type: "binary" });

      /* Get worksheet */
      self.ranges = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { raw: true }
      );

      self.insurance = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[2]],
        { raw: true }
      );

      self.gift = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[3]],
        { raw: true }
      );

      var model = workbook.Sheets[workbook.SheetNames[1]];
      model = XLSX.utils.sheet_to_json(model, { header: 1, raw: true });

      let model_title = model[1];
      model = model.slice(2, model.length - 1);
      model = model.map(m => {
        var obj = m.reduce(function(m, cur, i) {
          if (model_title[i]) {
            m[model_title[i]] = cur;
          } else {
            m["车款"] = cur;
          }

          return m;
        }, {});
        return obj;
      });
      self.model = model;
    };

    oReq.send();
  }
}
