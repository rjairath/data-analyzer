import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.css']
})
export class UploadPageComponent implements OnInit {

  extensionError: Boolean = false;
  fileContent: string = "";
  from_lat: Array<any> = [];
  from_long: Array<any> = [];
  to_lat: Array<any> = [];
  to_long: Array<any> = [];

  geoJSON1: Object = {};
  geoJSON2: Object = {};

  constructor() {}

  ngOnInit() {}
  
  readFile(input: FileList){
    //Add an extension check
    this.extensionError = false;
    let fileName = input[0].name;
    let ext = fileName.split('.')[1];
    if(ext != "csv" && ext != "CSV"){
      this.extensionError = true;
      return;
    }

    //Now log the lat and long columns
    let fileObject = input[0];
    let fileReader: FileReader = new FileReader();
    let self = this;

    fileReader.readAsText(fileObject);
    //This is an asynchronous function
    fileReader.onloadend = function(x) {
      let temp: any = x.target;
      let rows = temp.result.split('\n');
      for(let i=0; i<rows.length; i++){
        let r1 = rows[i].split(',');
        self.from_lat.push(r1[14]);
        self.from_long.push(r1[15]);
        self.to_lat.push(r1[16]);
        self.to_long.push(r1[17]);
      }
      self.makeGeoJSON();
    }
  }
  //Make 2 geoJSONS here
  makeGeoJSON(){
    //geoJSON1
    this.geoJSON1["type"] = "FeatureCollection";
    this.geoJSON1["features"] = [];
    for(let i=1; i<this.from_lat.length; i++){
      let x = this.from_long[i];
      let y = this.from_lat[i];

      if(x === "NULL" || y === "NULL"){
        continue;
      }

      let obj = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(x), Number(y)]
        },
      }
      this.geoJSON1["features"].push(obj);
    }

    //geoJSON2
    this.geoJSON2["type"] = "FeatureCollection";
    this.geoJSON2["features"] = [];
    for(let i=1; i<this.to_lat.length; i++){
      let x = this.to_long[i];
      let y = this.to_lat[i];

      if(x === "NULL" || y === "NULL"){
        continue;
      }

      let obj = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(x), Number(y)]
        },
      }
      this.geoJSON2["features"].push(obj);
    }
    // console.log(this.geoJSON1);
    // console.log(this.geoJSON2);
  }
}
