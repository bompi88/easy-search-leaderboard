import './filter.html';

import { PlayersIndex } from '../../../api/players/players_index.js';

Template.filter.helpers({

  categories() {
    const agg = PlayersIndex.getComponentMethods().getCursor().getAggregation('category');
    return agg ? agg.category.buckets : null;
  }

});
