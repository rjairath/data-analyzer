import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MAP_ACCESS_TOKEN } from '../../../app-env';

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
  travel_type_id: Array<any> = [];

  geoJSONArray1: Array<any> = [];
  geoJSONArray2: Array<any> = [];

  checkbox = [
    {label: "starting location", checked: false},
    {label: "ending location", checked: false}
  ];

  constructor() {}

  ngOnInit() {}
  
  readFile(input: FileList){
    //Add an extension check
    //Enable the checkbox buttons here
    this.extensionError = false;
    const ele1 = document.getElementById("checkbox1") as HTMLInputElement;
    const ele2 = document.getElementById("checkbox2") as HTMLInputElement;
    ele1.checked = false;
    ele2.checked = false;
    
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
        self.travel_type_id.push(r1[4]);
      }
      self.makeGeoJSON();
    }
  }
  //Make 2 geoJSONS here
  makeGeoJSON(){
    //geoJSONArray1
    for(let i=1; i<this.from_lat.length; i++){
      let x = this.from_long[i];
      let y = this.from_lat[i];
      let z = this.travel_type_id[i];

      if(!z || z == "NULL"){
        z = 2;
      }
      if(x === "NULL" || y === "NULL" || !x || !y){
        continue;
      }

      let obj = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(x), Number(y)]
        },
        properties: {
          travelType: Number(z)
        }
      }
      this.geoJSONArray1.push(obj);
    }

    //geoJSONArray2
    for(let i=1; i<this.to_lat.length; i++){
      let x = this.to_long[i];
      let y = this.to_lat[i];
      let z = this.travel_type_id[i];

      if(!z || z == "NULL"){
        z = 2;
      }
      if(x === "NULL" || y === "NULL" || !x || !y){
        continue;
      }

      let obj = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(x), Number(y)]
        },
        properties: {
          travelType: Number(z)
        }
      }
      this.geoJSONArray2.push(obj);
    }
    // debugger;
    // this.renderMap();
  }
  checkSelected(label: string){
    const ele1 = document.getElementById("checkbox1") as HTMLInputElement;
    const ele2 = document.getElementById("checkbox2") as HTMLInputElement;
    if(label == "starting location"){
      ele2.checked = false;
      this.renderMap1();
    }
    else{
      ele1.checked = false;
      this.renderMap2();
    }
  }
  renderMap1(){
    mapboxgl.accessToken = MAP_ACCESS_TOKEN;
    let temp1 = this.geoJSONArray1;

    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [77.67229, 12.92415],
      zoom: 11
    });
    map.on('load', function() {
      //Add Source 1
      map.addSource('fromPoints', {
        type: 'geojson',
        data: {
          "type": "FeatureCollection",
          "features":  temp1
        }
      });
      // add heatmap layer here
      map.addLayer({
        id: 'fromPoints-heat',
        type: 'heatmap',
        source: 'fromPoints',
        maxzoom: 15,
        paint: {
          // increase weight as diameter breast height increases
          'heatmap-weight': {
            property: 'travelType',
            type: 'exponential',
            stops: [
              [1, 0],
              [3, 1]
            ]
          },
          // increase intensity as zoom level increases
          'heatmap-intensity': {
            stops: [
              [11, 1],
              [15, 3]
            ]
          },
          // assign color values be applied to points depending on their density
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(236,222,239,0)',
            0.2, 'rgb(208,209,230)',
            0.4, 'rgb(166,189,219)',
            0.6, 'rgb(103,169,207)',
            0.8, 'rgb(28,144,153)'
          ],
          // increase radius as zoom increases
          'heatmap-radius': {
            stops: [
              [11, 15],
              [15, 20]
            ]
          },
          // decrease opacity to transition into the circle layer
          'heatmap-opacity': {
            default: 1,
            stops: [
              [14, 1],
              [15, 0]
            ]
          },
        }
      }, 'waterway-label');
      // add circle layer here
      map.addLayer({
        id: 'fromPoints-point',
        type: 'circle',
        source: 'fromPoints',
        minzoom: 14,
        paint: {
          // increase the radius of the circle as the zoom level and travelType value increases
          'circle-radius': {
            property: 'travelType',
            type: 'exponential',
            stops: [
              [{ zoom: 15, value: 1 }, 5],
              [{ zoom: 15, value: 3 }, 10],
              [{ zoom: 22, value: 1 }, 20],
              [{ zoom: 22, value: 3 }, 40],
            ]
          },
          'circle-color': {
            property: 'travelType',
            type: 'exponential',
            stops: [
              [1, 'rgb(236,222,239)'],
              [2, 'rgb(208,209,230)'],
              [3, 'rgb(166,189,219)'],
            ]
          },
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': {
            stops: [
              [14, 0],
              [15, 1]
            ]
          }
        }
      }, 'waterway-label');
    });

    map.on('click', 'fromPoints-point', function(e) {
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<b>travel_type:</b> ' + e.features[0].properties.travelType)
        .addTo(map);
    });
  }
  renderMap2(){
    mapboxgl.accessToken = MAP_ACCESS_TOKEN;
    let temp2 = this.geoJSONArray2;

    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [77.67229, 12.92415],
      zoom: 11
    });
    map.on('load', function() {
      //Add Source 1
      map.addSource('toPoints', {
        type: 'geojson',
        data: {
          "type": "FeatureCollection",
          "features":  temp2
        }
      });
      // add heatmap layer here
      map.addLayer({
        id: 'toPoints-heat',
        type: 'heatmap',
        source: 'toPoints',
        maxzoom: 15,
        paint: {
          // increase weight as diameter breast height increases
          'heatmap-weight': {
            property: 'travelType',
            type: 'exponential',
            stops: [
              [1, 0],
              [3, 1]
            ]
          },
          // increase intensity as zoom level increases
          'heatmap-intensity': {
            stops: [
              [11, 1],
              [15, 3]
            ]
          },
          // assign color values be applied to points depending on their density
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(236,222,239,0)',
            0.2, 'rgb(178,226,226)',
            0.4, 'rgb(102,194,164)',
            0.6, 'rgb(44,162,95)',
            0.8, 'rgb(0,109,44)'
          ],
          // increase radius as zoom increases
          'heatmap-radius': {
            stops: [
              [11, 15],
              [15, 20]
            ]
          },
          // decrease opacity to transition into the circle layer
          'heatmap-opacity': {
            default: 1,
            stops: [
              [14, 1],
              [15, 0]
            ]
          },
        }
      }, 'waterway-label');
      // add circle layer here
      map.addLayer({
        id: 'toPoints-point',
        type: 'circle',
        source: 'toPoints',
        minzoom: 14,
        paint: {
          // increase the radius of the circle as the zoom level and travelType value increases
          'circle-radius': {
            property: 'travelType',
            type: 'exponential',
            stops: [
              [{ zoom: 15, value: 1 }, 5],
              [{ zoom: 15, value: 3 }, 10],
              [{ zoom: 22, value: 1 }, 20],
              [{ zoom: 22, value: 3 }, 40],
            ]
          },
          'circle-color': {
            property: 'travelType',
            type: 'exponential',
            stops: [
              [1, 'rgb(236,222,239)'],
              [2, 'rgb(208,209,230)'],
              [3, 'rgb(166,189,219)'],
            ]
          },
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': {
            stops: [
              [14, 0],
              [15, 1]
            ]
          }
        }
      }, 'waterway-label');
    });

    map.on('click', 'toPoints-point', function(e) {
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<b>travel_type:</b> ' + e.features[0].properties.travelType)
        .addTo(map);
    });
  }
}
