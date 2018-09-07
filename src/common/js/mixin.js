import {mapState, mapGetters, mapMutations, mapActions} from 'vuex'
import {shuffle} from '@/common/js/util'
import {playMode} from '@/common/js/config'
import SearchBox from '@/base/search-box/search-box'
import Suggest from '@/components/suggest/suggest'

export const playlistMixin = {
  computed: {
    ...mapState([
      'playlist'
    ])
  },
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  activated () {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist (newval) {
      this.handlePlaylist(newval)
    }
  },
  methods: {
    handlePlaylist () {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    ...mapState([
      'sequencelist',
      'playlist',
      'mode',
      'favoriteList'
    ]),
    ...mapGetters([
      'currentSong'
    ]),
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    }
  },
  methods: {
    getCurrentIndex (list) {
      return list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
    },
    changeMode () {
      const mode = (this.mode + 1) % 3
      this.setPlayingMode(mode)
      let list = []
      if (mode === playMode.random) {
        list = shuffle(this.sequencelist)
      } else {
        list = this.sequencelist
      }
      this.setCurrentIndex(this.getCurrentIndex(list))
      this.setPlaylist(list)
    },
    ...mapMutations({
      setPlayingMode: 'SET_PLAYING_MODE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE',
      setPlaylist: 'SET_PLAYLIST'
    }),
    getFavoriteIcon (song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      } else {
        return 'icon-not-favorite'
      }
    },
    toggleFavorite (song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    isFavorite (song) {
      let index = this.favoriteList.findIndex(item => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}

export const searchMixin = {
  data () {
    return {
      query: ''
    }
  },
  computed: {
    ...mapState([
      'searchHistory'
    ])
  },
  components: {
    SearchBox,
    Suggest
  },
  methods: {
    addQuery (query) {
      this.$refs.searchbox.setQuery(query)
    },
    onQueryChange (query) {
      this.query = query
    },
    saveSearch () {
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
