let recentChannelsDB:Nedb;

/**
 * Updates the path to the DB.
 */
function updatePath(updatedPath:string): void {
    recentChannelsDB = new Datastore({ filename: `${updatedPath}/data/recentChannels.db`, autoload: true });
}

/**
 * Adds a recent channel to GlimBoi
 * @param {string} object The channel object
 * @returns If successful returns the user.
 */
function addRecentChannel(channel:string, timestamp = null, autoJoin = false): Promise<channel> {
    timestamp = timestamp ?? (Date.now());

    return new Promise(done => {
      	recentChannelsDB.find({ channel: channel }, function (err:string, doc: string | any[]) {
        	if (doc.length == 0) {
          		console.log("No channel was found with the name " + channel);
        		recentChannelsDB.insert({channel: channel, timestamp: timestamp}, function (err, doc:channel) {
          			console.log(doc);
          			done(doc)
        		});
      		} else {
        		recentChannelsDB.update({ channel: channel }, { $set: { timestamp: timestamp } }, {returnUpdatedDocs: true}, function (err, num, doc:channel) {
          			console.log(doc);
          			done(doc)
        		});
      		}
    	})
  	})
}

/**
 * Disables autoJoin for all channels, then enables for a specified channel
 * @param {string} id
 * @param {boolean} autoJoinEnabled
 */
function setAutoJoinChannelByID(id:string, autoJoinEnabled:boolean): Promise<null | channel > {
  	return new Promise(done => {
    	console.log(`Disabling autoJoin for all channels`);

    	recentChannelsDB.update({ autoJoin: true }, { $set: { autoJoin: false } }, {returnUpdatedDocs: false}, function (err, num, doc) {
      		if (autoJoinEnabled) {
        		console.log(`Setting autojoin to ${autoJoinEnabled} for ${id}`);
        		recentChannelsDB.update({ _id: id }, { $set: { autoJoin: autoJoinEnabled } }, {returnUpdatedDocs: true}, function (err, num, doc:channel) {
          			done(doc)
        		});
      		} else {
        		done(null);
      		}
    	});
  	});
}

/**
 * Removes a channel from recent chat DB, by the channel ID, the ID is what's in the DB
 * @param {string} id Name of the id
 */
function removeRecentChannelByID(id:string):Promise<void> {
  	return new Promise(resolve => {
    	recentChannelsDB.remove({ _id: id }, { multi: false }, function (err, doc) {
      		resolve()
    	});
  	});
}


/**
 * Get all recent Channels
 * @returns Returns array of channel objects
 */
function getAllRecentChannels(): Promise<channel[]> {
  	return new Promise(resolve => {
    	recentChannelsDB.find({}, function (err:string, docs) {
      		console.log('Returning all recent channels.');
      		resolve(docs);
    	})
  	})
}

export { updatePath, addRecentChannel, setAutoJoinChannelByID, getAllRecentChannels, removeRecentChannelByID };