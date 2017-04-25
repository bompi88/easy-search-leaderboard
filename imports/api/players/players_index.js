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
        filter = { term: { 'category.raw': categoryFilter } };
      }

      // add aggregations
      const aggs = {
        category: {
          filter: {},
          aggs: {
            category: {
              terms: {
                field: 'category.raw',
                min_doc_count: 0,
                order: { _term : 'asc' }
              }
            }
          }
        }
      };

      return {
        query: {
          bool: {
            must: body.query,
            filter
          }
        },
        aggs,
        stored_fields: body.fields
      };
    }
  }),
  mapping: {
    players: {
      properties: {
        name: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        },
        score: {
          type: 'integer'
        },
        category: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword',
              ignore_above: 256
            }
          }
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
