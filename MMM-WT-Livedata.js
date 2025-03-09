Module.register("MMM-WT-Livedata", {

  defaults: {
    exampleContent: "",
    updatesEvery: 120,
    entriesToShow: 5,
    via: "",
    displaySeconds: false
  },

  /**
   * Apply the default styles.
   */
  getStyles() {
    return ["template.css"]
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start() {
    this.templateContent = this.config.exampleContent

    this.startFetchingLoop(this.config.updatesEvery);

  },

  /**
   * Handle notifications received by the node helper.
   * So we can communicate between the node helper and the module.
   *
   * @param {string} notification - The notification identifier.
   * @param {any} payload - The payload data`returned by the node helper.
   */
  socketNotificationReceived: function (notification, payload) {
    if (notification === "DEPARTURES_FETCHED") {
      this.update(payload)
      //this.templateContent = `${this.config.exampleContent} ${payload.text}`
      //this.updateDom()
    }
  },

  /**
   * Render the page we're on.
   */
  getDom() {
    const wrapper = document.createElement("div")
    wrapper.innerHTML = `<b><header>${this.config.stationName}</header></b>${this.templateContent}`

    return wrapper
  },

  addRandomText() {
    this.sendSocketNotification("GET_RANDOM_TEXT", { amountCharacters: 15 })
  },

  /**
   * This is the place to receive notifications from other modules or the system.
   *
   * @param {string} notification The notification ID, it is preferred that it prefixes your module name
   * @param {number} payload the payload type.
   */
  notificationReceived(notification, payload) {
    if (notification === "TEMPLATE_RANDOM_TEXT") {
      this.templateContent = `${this.config.exampleContent} ${payload}`
      this.updateDom()
    }
  },

  update (data) {
    let counter = this.config.entriesToShow
    let text = `<table>`
    let timeClass = ""
    let date
    let isVia
    data.every(stop => {
      timeClass = ""
      isVia = false
 
      stop.onwardLocations.every(location => {
        if(location.parent.id == this.config.via){
          isVia = true
          return false
        }
        return true
      })

      if(!isVia){
        return true
      }

       text += "<tr>"

      if (stop.hasOwnProperty("realtimeStatus")){
      switch (stop.realtimeStatus[0]) {
        case "MONITORED":
          date = new Date(stop.departureTimeEstimated);

          if(stop.departureTimeEstimated === stop.departureTimePlanned){
            timeClass = "onTime"
          } else {
            timeClass = "delayed"
          }


          break;
        case "TRIP_CANCELLED":
          date = new Date(stop.departureTimePlanned);
          timeClass = "cancelled"
          break;
        default:
          date = new Date(stop.departureTimePlanned);
          break;
      }
    } else {
      date = new Date(stop.departureTimePlanned);

    }

      text += "<td class='line'>" + stop.transportation.disassembledName + "</td>" //Add line Name

      const formattedTime = this.config.displaySeconds ? date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second:"2-digit" }) : date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit'})
      text += `<td class="${timeClass}">${formattedTime}</td>`
      text += "</tr>"
      counter--

      if (counter > 0){
        return true;
      } else {
        return false;
      }

    });
    text += "</table>"
    this.templateContent = text
    this.updateDom()
  },

  startFetchingLoop (interval) {
    this.sendSocketNotification("FETCH_DEPARTURES", this.config.stationID);

      setInterval(() => {
        this.sendSocketNotification("FETCH_DEPARTURES", this.config.stationID);
      }, interval * 1_000);
  },
})
