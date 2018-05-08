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

  public selectedTypeId;

  constructor() {}
  selectedType(id) {
    this.selectedTypeId = id;
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
      console.log(model);
    };

    oReq.send();
  }
}
