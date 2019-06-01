import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadPageComponent } from './upload-page/upload-page.component';

const routes: Routes = [
  {path: 'upload', component: UploadPageComponent},
  {path: '', redirectTo: 'upload', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
