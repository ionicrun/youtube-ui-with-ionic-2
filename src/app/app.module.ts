import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

export class HammerConfigExt extends HammerGestureConfig {
  overrides = <any>{
    // overwrite the default direction Hammer.DIRECTION_HORIZONTAL
    // to support both .DIRECTION_HORIZONTAL and .DIRECTION_VERTICAL
    'pan': { direction: window['Hammer'].DIRECTION_ALL }
  }
}

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    // use the newly created class 
    // for the HAMMER_GESTURE_CONFIG provider
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfigExt
    }
  ]
})

export class AppModule { }
