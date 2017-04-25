import { Players } from './players.js';
import { Index } from 'meteor/easy:search';
import { _ } from 'meteor/underscore';

export const PlayersIndex = new Index({
  engine: new EasySearch.ElasticSearch({
    client: {
      host: Meteor.settings && Meteor.settings.elasticsearch && Meteor.settings.elasticsearch.host,
      sniffOnStart: false,
      // log: 'trace',
      requestTimeout: 30000
    },
    sort: function() {
      return {
        _score: { order: 'desc' }
      }
    },
    body: function (body, options) {
      let filter = {};
      let categoryFilter = options.search.props.categoryFilter;

      if (_.isString(categoryFilter) && !_.isEmpty(categoryFilter)) {
        filter = { term: { category: categoryFilter } };
      }

      // add aggregations
      const aggs = {
        category: {
          filter: {},
          aggs: {
            category: {
              terms: {
                field: 'category',
                min_doc_count: 0,
                order: { _term : 'asc' }
              }
            }
          }
        }
      };

      return {
        query: {
          filtered: {
            query: body.query,
            filter
          }
        },
        aggs,
        fields: body.fields
      };
    }
  }),
  mapping: {
    players: {
      properties: {
        name: {
          type: 'string',
          fields: {
            raw: { type: 'string', index: 'not_analyzed' }
          }
        },
        score: {
          type: 'integer'
        },
        category: {
          type: 'string',
          index: 'not_analyzed'
        }
      }
    }
  },
  name: 'players',
  collection: Players,
  fields: ['name', 'category'],
  defaultSearchOptions: {
    limit: 8
  },
  permission: () => {
    //console.log(Meteor.userId());
    return true;
  }
});
