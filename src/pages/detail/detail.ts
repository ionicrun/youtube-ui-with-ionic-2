import { Component, ElementRef, Renderer, ViewChild } from '@angular/core';
import { IonicPage, NavController, Content, DomController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html'
})

export class DetailPage {

  // the field that holds the card data
  public card;

  // read the elementReference, cast the type to any, to access 
  // the nativeElement
  @ViewChild(Content, { read: ElementRef }) content: any;

  // nativeElement of the current page
  private detailPage;

  // nativeElement of the thumbnail which will be dragged
  private thumb;

  // point where the dragging needs to end
  private virtualPageEndpoint;

  // fields that keeps track how far thumbnail was dragged
  private pannedYPercentage = 0;
  // the finale scale of the image
  private finalTransformScaled = 0.5;
  // the finale Y (vertical) position of the thumbnail
  private finalTransformYPosition;

  // inital Y and X coordinates of the touched point
  private initialClientYPosition;
  private initialClientXPosition;

  // flag that tracks the state of the thumbnail
  // if it is minimized or not
  private isMinimized = false;

  // flag responsible for setting the
  // disable-scroll class on the ion-content
  private disableScrolling = false;

  // two flags to decide if
  // 1) the closing action is allowed
  // 2) the closing gesture (panleft/right) is performed
  private isClosingAllowed = false;
  private isClosing = false;

  // flag to decide to pop the page
  private doPopPage = false;


  constructor(

    public domCtrl: DomController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private elRef: ElementRef,
    public renderer: Renderer

  ) {

    // get the handle to the nativeElement of the page
    this.detailPage = this.elRef.nativeElement;

    // extract the data pushed from the master page
    this.card = this.navParams.data;

  }


  public onPanStart(evt) {

    // as soon as we start panning, disable scrolling
    this.disableScrolling = true;

    // get the element we are dragging
    this.thumb = evt.srcEvent.srcElement;

    // get the original height of the thumbnail
    let thumbOriginalHeight = this.thumb.offsetHeight;

    // get the effective page height
    let pageHeight = this.detailPage.offsetHeight;

    // set the inital coordinates we touch the screen
    this.initialClientYPosition = evt.srcEvent.clientY;
    this.initialClientXPosition = evt.srcEvent.clientX;

    // calculate the final Y position the thumbnail is palced
    this.finalTransformYPosition = pageHeight - thumbOriginalHeight;

    // calculate the virtial endpoint, the point where the dragging needs to 'stop' / cursor ends
    // it is also a helper to calculate the percentage the user dragged the thumbnail
    this.virtualPageEndpoint = pageHeight - (thumbOriginalHeight * .5) - this.initialClientYPosition;


    // if the panning starts from a minimized position, we want the point where
    // the panning needs to 'stop' at the top again, thus an adjustment is needed
    if (this.isMinimized) {

      this.virtualPageEndpoint = thumbOriginalHeight * .5 - this.initialClientYPosition;

    }

    // a two color background image is used to have a 'transparent' area behind the thumbnail
    // the top color (transparent) is the height of the original thumbnail heigt and the rest is white
    this.renderer.setElementStyle(this.content.nativeElement, 'background-position', `0px 0px, 0px ${thumbOriginalHeight}px`);
    this.renderer.setElementStyle(this.content.nativeElement, 'background-size', `100% ${thumbOriginalHeight}px, 100% 100%`);

  }

  
  public onPanEnd(evt) {

    // we can alsways reset the isClosing flag
    // as soon as the panend event is triggered
    this.isClosing = false;

    // did we pan far enough to the left/right to pop the page?
    // if so, pop it and return, no need to execute any other code
    if (this.doPopPage) {

      this.navCtrl.pop({ animate: true, animation: 'md-transition' });
      return;
    }

    // if we are in minimized state...
    if (this.isMinimized) {

      // transform 'back' to minimized state
      if (this.pannedYPercentage < .5) {

        this.toMinimized();

      } else {

        // transform to maximized state
        // set the minimized flag to false
        this.toMaximized();

      }


    } else {

      if (this.pannedYPercentage < .5) {

        // transform 'back' to maximized state
        this.toMaximized();

      } else {

        // transform to minimized state
        // set the minimized flag to true
        this.toMinimized();

      }

    }

  }


  public onTap($evt) {

    // if we are in minimized state, and tapped the
    // thumbnail, return to a maximized state
    if (this.isMinimized) {

      // transform to maximized state
      // set the minimized flag to false
      this.toMaximized(350);

    }

  }


  public onPanX($evt) {

    // if the closing movement is not allowed (because a Y movement is going on)
    // return, just do nothing
    if (!this.isClosingAllowed) {

      return;
    }

    // set the global flag that the closing movement is going on
    this.isClosing = true;

    // reset the pannedYPercentage
    this.pannedYPercentage = 0;

    // correct the deltaX for the fact that its transform-origin is right center
    let xPosition = $evt.deltaX * 2;
    let opacity;

    // drag to the right, increase the opacity faster
    if ($evt.deltaX > 0) {

      opacity = xPosition / this.thumb.offsetWidth;
    } else {

      // drag to the left, don't fade out to fast
      opacity = Math.abs($evt.deltaX / (this.thumb.offsetWidth * .68));
    }

    // to pop the page, the thumbnail must at least 'touch' the left side of the view
    // or be dragged out for at leat 50% to the right
    if (
      $evt.deltaX < -1 * (this.detailPage.offsetWidth / 2)
      ||
      $evt.deltaX > (this.detailPage.offsetWidth * 0.25)
    ) {

      this.doPopPage = true;
    } else {

      this.doPopPage = false;
    }

    // use the DomController to apply the transform and opacity
    this.domCtrl.write(() => {

      this.renderer.setElementStyle(this.thumb, 'transition', 'none');
      this.renderer.setElementStyle(this.thumb, 'transition', 'none');

      this.renderer.setElementStyle(this.thumb, 'transform', `scale(${this.finalTransformScaled}) translate(${xPosition}px, 0)`);
      this.renderer.setElementStyle(this.thumb, 'opacity', `${1 - opacity}`);

    });

  }


  public onPanY($evt) {

    // if we are in a closing X movement, prevent the thumbnail from being dragged upwards
    if (this.isClosing) {

      return;
    }

    // if the thumbnail is restored to its minimized state
    // and a panup/down takes place, we block the panleft/right
    this.isClosingAllowed = false;

    // helpers
    let scaled;
    let yPosition;

    let pageTransparency;
    let contentTransparency;

    // calculate the direction we are panning (positive/negative)
    let direction = ($evt.deltaY) / this.virtualPageEndpoint;

    // always make the Y panned percentage positive, that makes calculations easier
    this.pannedYPercentage = Math.abs(direction);

    // for the two states, a minimized and maximized different rules apply
    // it is a bit verbose but easy maintainable this way
    if (this.isMinimized) {

      // overdrag @ bottom in minimized state
      if (direction < 0) {
        // limit the thumbnail to be dragged outside the view
        this.pannedYPercentage = 0;
      }

      // overdrag @ top in minimized state
      if (direction > 1) {
        // limit the thumbnail to be dragged outside the view
        this.pannedYPercentage = 1;
      }

      // adjust transform scale and translate since we 'come' from a minimized state
      scaled = this.finalTransformScaled + (this.pannedYPercentage * this.finalTransformScaled);
      yPosition = this.finalTransformYPosition - (this.pannedYPercentage * this.finalTransformYPosition);

      pageTransparency = this.pannedYPercentage * .5;
      contentTransparency = this.pannedYPercentage;

    } else {

      // overdrag @ top in original state
      if (direction < 0) {
        // limit the thumbnail to be dragged outside the view
        this.pannedYPercentage = 0;
      }

      // overdrag @ bottom in original state
      if (direction > 1) {
        // limit the thumbnail to be dragged outside the view
        this.pannedYPercentage = 1;
      }

      // calculate the transform scale and translate
      scaled = 1 - (this.pannedYPercentage * this.finalTransformScaled);
      yPosition = this.pannedYPercentage * this.finalTransformYPosition;

      pageTransparency = (1 - this.pannedYPercentage) * .5;

      // we don't want full transparency, if we panned fully downwards
      contentTransparency = 1.25 - this.pannedYPercentage;

    }

    // use the DomController again to 
    // transform, adjust the backgroundcolor and scale the thumbnail
    this
      .domCtrl
      .write(() => {

        this.renderer.setElementStyle(this.thumb, 'transition', 'none');

        this.renderer.setElementStyle(this.thumb, 'transform-origin', 'center right');
        this.renderer.setElementStyle(this.thumb, 'transform', `scale(${scaled})`);

        this.renderer.setElementStyle(this.detailPage, 'transition', 'none');
        this.renderer.setElementStyle(this.detailPage, 'background', `rgba(0, 0, 0, ${pageTransparency})`);

        this.renderer.setElementStyle(this.content.nativeElement, 'transition', 'none');
        this.renderer.setElementStyle(this.content.nativeElement, 'transform', `translate(0, ${yPosition}px)`);

        this.renderer.setElementStyle(

          this.content.nativeElement,

          'background-image',

          `linear-gradient(to bottom, transparent, transparent), 
           linear-gradient(to bottom, rgba(255, 255, 255, ${contentTransparency}), rgba(255, 255, 255, ${contentTransparency}))`

        );

      });


  }


  private toMaximized(duration?) {

    // always remove the disable-scrolling class when restoring to the maximized state
    this.disableScrolling = false;

    this.isMinimized = false;
    this.isClosingAllowed = false;

    this
      .domCtrl
      .write(() => {

        this.transformScaleTo(1, 0, duration);

        this.renderer.setElementStyle(this.content.nativeElement, 'background-image', '');
        this.renderer.setElementStyle(this.detailPage, 'pointer-events', '');
        this.renderer.setElementStyle(this.detailPage, 'transition', `background ${duration || 150}ms`);
        this.renderer.setElementStyle(this.detailPage, 'background', 'rgba(0, 0, 0, 0.5)');

      });


  }


  private toMinimized() {

    this.isMinimized = true;
    this.isClosingAllowed = true;

    this
      .domCtrl
      .write(() => {

        this.transformScaleTo(this.finalTransformScaled, this.finalTransformYPosition);

        this.renderer.setElementStyle(this.thumb, 'opacity', '1');

        this.renderer.setElementStyle(this.detailPage, 'pointer-events', 'none');
        this.renderer.setElementStyle(this.detailPage, 'transition', 'background 150ms');
        this.renderer.setElementStyle(this.detailPage, 'background', 'rgba(0, 0, 0, 0)');

        this.renderer.setElementStyle(
          this.content.nativeElement,
          'background-image',
          `linear-gradient(to bottom, transparent, transparent), 
           linear-gradient(to bottom, rgba(255, 255, 255, .25), rgba(255, 255, 255, .25))`
        );

      });

  }


  // helper to transform to a specific scale and Y position of the thumbnail
  private transformScaleTo(scale, yPos, duration?: number) {

    // apply the transition to the element
    this.renderer.setElementStyle(this.thumb, 'transition', `transform ${duration || 150}ms`);
    this.renderer.setElementStyle(this.thumb, 'transform', `scale(${scale})`);

    // apply a transition to the page
    this.renderer.setElementStyle(this.content.nativeElement, 'transition', `transform ${duration || 150}ms`);
    this.renderer.setElementStyle(this.content.nativeElement, 'transform', `translate(0, ${yPos}px)`);

  }


}