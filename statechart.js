// ========================================================================
// SproutCore
// copyright 2008 Erich Atlas Ocean.
// ========================================================================

/**
  @namespace
  
  SC.Statechart is a mixin that implements a simplified statechart architecture.
  Usually, you'll apply this to your application's core object:
  
  <pre>
  {{{
    MyApp = SC.Object.create(SC.Statechart, {
      // SC.Statechart properies and methods are now available...
      
      someAction: function() {
        var handled = NO; // optional, not required for statechart semantics, but good to know :)
        
        switch ( this.state.a ) {
          case 1:
            this.goState('a', 2); // update state and stateHistory properties, then: this.goStateA2();
            handled = YES;
            break;
          case 2:
            this.goState('a', 1); // update state and stateHistory properties, then: this.goStateA1();
            handled = YES;
            break;
        }
        
        if (!handled) alert( 'MyApp#someAction was not handle in state %@[%@]'.fmt('a', this.state.a) );
      },
      
      goStateA1: function() { alert('in state A[1]'); },
      goStateA2: function() { alert('in state A[2]'); }
      
    });
  }}}
  </pre>
  
  In your main.js file's main() function, set the start state:
  
  <pre>
  {{{
    function main() {
      MyApp.state.set('a', 1); // set the start state
      
      // other stuff
    } ;
  }}}
  </pre>
  
  You can easily access history states, which are automatically maintained by the SC.Statechart mixin:
  
  <pre>
  {{{
    switch ( this.state.history.a ) {
      case 1:
        console.log("the history value for state 'a' is 1");
        break;
    }
  }}}
  </pre>
  
  To put up a JavaScript alert each time your statechart changes, do:
  
  <pre>
  {{{
    this.state.alert = YES;
  }}}
  </pre>
  
  Similarly, you can receive a log in the console each time your statechart changes:
  
  <pre>
  {{{
    this.state.log = YES;
  }}}
  </pre>
  
  Simply set the properties to NO when you don't want to be alerted or see logs anymore.
  
  To see all of your defined state and state.history values in a JavaScript alert, do:
  
  <pre>
  {{{
    this.state.show();
  }}}
  </pre>
  
  @author Erich Atlas Ocean
  @version 1.0
*/
SC.Statechart = {
  
  /** @private */
  initMixin: function() {
    // each object has its own state...
    this.state = SC.Object.create({
      log: NO,
      alert: NO,
      history: SC.Object.create(),
      
      show: function() {
        var regex = /^[a-z]$/;
        var result = 'States:\n\n';
        
        for (var key in this) {
          if ( key.match(regex) ) result = result + key + this[k] + ': ' + '\n';
        }
        
        result += '\n\nHistory:\n\n';
        
        for (var key in this.history) {
          if ( key.match(regex) ) result = result + key + this.history[key] + ': ' + '\n';
        }
        
        alert(result);
      },
      
      
      propertyObserver: function(observer,target,key,value) {
        if (this.alert) alert('Entering state %@[%@]'.fmt(key,value));
        if (this.log) console.log('Entering state %@[%@]'.fmt(key,value));
      }
    });
  },
  
  /**
    @field {SC.Object} the state values for this object
  */
  state: null, // overridden in initMixin
  
  /**
    This is the method to use to changes states:<br>
    
    <code><pre>
      this.goState('b', 4); // transition to state B[4] and call this.goStateB4()
    </pre></code>
    
    If you need to give animation an opporunity to run, you con set delay to YES:<br>
    
    <code><pre>
      this.goState('m', 6, YES); // transitions to state M[6] on the next run loop
    </pre></code>
    
    @param {String} stateVar
      the state variable you want to go to, e.g. 'a'
      
    @param {Integer} index
      the state index you want to go to, e.g. 1
      
    @param {Boolean} delay
      pass NO or undefined to enter the state immediately, YES to enter the state the next run loop
  */
  goState: function(stateVar,index,delay) {
    var func = this['goState%@%@'.fmt(stateVar.toUpperCase(),index)];
    
    if (func === undefined) {
      alert('The goState%@%@ function is undefined.'.fmt(stateVar.toUpperCase(),index));
    }
    else if (SC.typeOf(func) !== SC.T_FUNCTION) {
      alert('The goState%@%@ property is not a function: %@.'.fmt(stateVar.toUpperCase(),index, func));
    }
    else {
      if (delay) { // call this.func() on the next run loop to give animation an opportunity to run
        var that = this;
        function() {
          that.state.set(stateVar, index);
          that.state.history.set(stateVar, index);
          func.call(that);
        }.invokeLater();
      }
      else {
        this.state.set(stateVar, index);
        this.state.history.set(stateVar, index);
        func.call(this);
      }
    }
  }
  
} ;