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
    }
  }
}
