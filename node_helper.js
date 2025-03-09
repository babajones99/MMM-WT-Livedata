const NodeHelper = require("node_helper")

module.exports = NodeHelper.create({

  socketNotificationReceived (notification, payload) {
    switch (notification) {
      case "CREATE_FETCHER":
        this.createFetcher(payload);
        break;

      case "FETCH_DEPARTURES":
        this.fetchDepartures(payload);
        break;
    }
  },

  async fetchDepartures (stationID) {
    try {
      const response = await fetch('https://www.westfalenfahrplan.de/nwl-efa/XML_DM_REQUEST?outputFormat=rapidJSON&useRealtime=1&depType=stopEvents&includeCompleteStopSeq=1&mode=direct&name_dm='+stationID+'&type_dm=any');

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      this.sendSocketNotification("DEPARTURES_FETCHED", data.stopEvents);
  } catch (error) {
      console.error('Error fetching data:', error.message);
  }
  }

})
