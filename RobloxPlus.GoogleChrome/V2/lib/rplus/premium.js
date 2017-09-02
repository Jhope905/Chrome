﻿var RPlus = RPlus || {};

RPlus.premium = RPlus.premium || (function () {
	var knownPremiums = {};

	return {
		getPremium: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) !== "number") {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			if (userId <= 0) {
				resolve(null);
				return;
			} else if (knownPremiums.hasOwnProperty(userId)) {
				resolve(knownPremiums[userId]);
				return;
			}

			$.get("http://api.roblox.plus/v1/rpluspremium/" + userId).done(function (data) {
				if (data.data) {
					knownPremiums[userId] = {
						expiration: data.data.expiration ? new Date(data.data.expiration).getTime() : null
					};
					resolve(knownPremiums[userId]);
				} else {
					resolve(null);
				}
			}).fail(function () {
				reject([{ code: 0, message: "HTTP Request Failed" }]);
			});
		}),

		isPremium: $.promise.cache(function (resolve, reject, userId) {
			this.getPremium(userId).then(function(premium) {
				resolve(premium ? true : false);
			}).catch(reject);
		}, {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		}),

		allThemesUnlocked: $.promise.cache(function(resolve, reject, userId) {
			this.isPremium(userId).then(function(premium) {
				if (premium) {
					resolve(true);
					return;
				}

				Roblox.inventory.userHasBadge(userId, 375602203).then(resolve).catch(reject);
			}).catch(reject);
		})
	};
})();

RPlus.premium = $.addTrigger($.promise.background("RPlus.premium", RPlus.premium));


// WebGL3D
