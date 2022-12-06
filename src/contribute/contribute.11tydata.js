require('dotenv').config();

const isDevEnv = process.env.ELEVENTY_ENV === 'development';
const todaysDate = new Date();

function showDraft(data) {
	const isDraft = 'draft' in data && data.draft !== false;
	const isFutureDate = data.page.date > todaysDate;
	return isDevEnv || (!isDraft && !isFutureDate);
}

module.exports = function() {
	return {
		eleventyComputed: {
			eleventyExcludeFromCollections: function(data) {
				if(showDraft(data)) {
					return data.eleventyExcludeFromCollections;
				}
				else {
					return true;
				}
			},
			permalink: function(data) {
				if(showDraft(data)) {
					return data.permalink
				}
				else {
					return false;
				}
			},
      eleventyNavigation: {
        key: function(data) {   
          if(showDraft(data)) {
            return data.title
          }
          else {
            return false;
          }
        }
      },
      sidebar: function(data) {
        return 'toc';
      },
      background: function(data) {
				if(('draft' in data && data.draft !== false) || (data.page.date > todaysDate)) {
					return 'text-white bg-info'
				}
				else {
					return 'bg-white';
        }
      }
		}
	}
}