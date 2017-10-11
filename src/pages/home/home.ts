import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  public cards = [{
    imgAvatar: 'assets/img/marty-avatar.png',
    name: 'Marty McFly',
    dob: 'November 5, 1955',
    imgCover: 'assets/img/advance-card-bttf.png',
    quote: 'Wait a minute. Wait a minute, Doc. Uhhh... Are you telling me that you built a time machine... out of a DeLorean?! Whoa. This is heavy.',
    likes: 12,
    comments: 4,
    createdAt: '11h ago'
  },
  {
    imgAvatar: 'assets/img/sarah-avatar.png',
    name: 'Sarah Connor',
    dob: 'May 12, 1984',
    imgCover: 'assets/img/advance-card-tmntr.jpg',
    quote: 'I face the unknown future, with a sense of hope. Because if a machine, a Terminator, can learn the value of human life, maybe we can too.',
    likes: 30,
    comments: 64,
    createdAt: '11h ago'
  },
  {
    imgAvatar: 'assets/img/ian-avatar.png',
    name: 'Dr. Ian Malcolm',
    dob: 'June 28, 1990',
    imgCover: 'assets/img/advance-card-jp.jpg',
    quote: 'Your scientists were so preoccupied with whether or not they could, that they didn\'t stop to think if they should.',
    likes: 46,
    comments: 66,
    createdAt: '2d ago'
  }];


  constructor(

    public navCtrl: NavController

  ) { }


  public pushDetailPage(card) {
    // to prevent stacked pages, always pop to the root
    // and then push the page. some nuance could be added
    // here of course
    this
      .navCtrl
      .popToRoot()
      .then(() => {
        this.navCtrl.push('DetailPage', card);
      });

  }

}