### architecture so far:
* main: reads a configuration and calls austin, spawning ausitin, our bot.
* austin: the object that interacts with slack
  * 'owns' a context that keeps track of everythign austin needs to remember
  * has onOpen, onMessage, and onError methods to keep track of what is going
    on in the slack application.
    * onMessage currently calls an austin::parseMessage method, that should
      probably be written in another object.
    * onOpen calls out to console and has the scheduler start two jobs
    * onError just logs the error to console
* context: stores the current state that austin knows about

### things we need to do:

### features i know i want:
