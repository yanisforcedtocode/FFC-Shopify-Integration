'use strict'
// === init TS search client
let client = new Typesense.SearchClient({
    'nodes': [{
      'host': '2y9h70d3prw6uv8jp-1.a1.typesense.net', // For Typesense Cloud use xxx.a1.typesense.net
      'port': '443',      // For Typesense Cloud use 443
      'protocol': 'https'   // For Typesense Cloud use https
    }],
    'apiKey': 'itq7jicFo1XypYg2paZKPQx0qxJFgbG6',
    'connectionTimeoutSeconds': 2
  })

class TS_AC {
  constructor() {
    this.initState = {
      search: {
        rawQuery: false,
        formatedQuery: false,
        searchParams: false,
        isSubmited: false,
        submitTime: false,
        searchTime: false,
        isListOpen: false,
        facets:["Intensity","Online available","Physical available","Equipments","Tag"],
        filterby:{},
        getPage:1,
        hitsPerPage: 3
      },
      response: {
        facet: [],
        activeFacet: [],
        ttlPage: 1,
        currentPage: 1,
        tsResponse: false,
        tsQuery: false,
        matchTokens:[],
        currentPage:1,
        ttlPage:1
      },
    };
    // Elements
    this.currentState = JSON.parse(JSON.stringify(this.initState));
    this.textInput = document.querySelector(
      "#TS__AC__section__container__textField"
    );
    this.dataList = document.querySelector(
      "#TS__AC__section__container__dataList"
    );
    this.searchBtn = document.querySelector(
        "#TS__AC__section__container__searchBtn"
    );
    this.searchResults = document.querySelector(
        "#TS__AC__results"
    );
    this.filters = document.querySelector("#TS__AC__fitlers__container")
    this.pageBtnNxt = document.querySelector("#pageSelect__container__right")
    this.pageBtnPrev = document.querySelector("#pageSelect__container__left")
    this.pageNum = document.querySelector("#pageSelect__container__pageNum")
  }
  // listeners
  listenToElm(elm, fn, self = this, event = "input") {
    elm.addEventListener(event, (e) => {
      if (fn) {
        fn(e, self);
      }
    });
  }
  callByInterval(elm, fn, self = this, event = "input") {
    setInterval(fn, 500, elm, self, event);
  }
  recursiveFn(elm, fn, self = this, event = "input") {
    const myPromise = new Promise((resolve) => {
      fn(resolve, self);
    });
  }
  // handlers
  limitQueryRate(ms, self) {
    const triggerTime = Date.now();
    if (!self.currentState.search.submitTime) {
      self.currentState.search.submitTime = triggerTime;
      return true;
    }
    if (
      self.currentState.search.submitTime &&
      triggerTime - self.currentState.search.submitTime > ms
    ) {
      self.currentState.search.submitTime = Date.now();
      return true;
    }
    if (
      self.currentState.search.submitTime &&
      triggerTime - self.currentState.search.submitTime <= ms
    ) {
    //   console.log(`query over limited rate at ${ms}ms`);
      return false;
    } else return false;
  }
  limitSearchRate(ms, self) {
    const triggerTime = Date.now();
    if (!self.currentState.search.searchTime) {
      self.currentState.search.searchTime = triggerTime;
      return true;
    }
    if (
      self.currentState.search.searchTime &&
      triggerTime - self.currentState.search.searchTime > ms
    ) {
      self.currentState.search.searchTime = Date.now();
      return true;
    }
    if (
      self.currentState.search.searchTime &&
      triggerTime - self.currentState.search.searchTime <= ms
    ) {
    //   console.log(`query over limited rate at ${ms}ms`);
      return false;
    } else return false;
  }
  // format
  removeHTMLTags(str){
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
    // Regular expression to identify HTML tags in 
    // the input string. Replacing the identified 
    // HTML tag with a null string.
    return str.replace( /(<([^>]+)>)/ig, '');
}
  formatDataList(res, self) {
    let dataListArr = []
    if (res?.hits?.length >= 1) {
      res.hits.forEach((el_01) => {
        if (el_01?.highlights?.length >= 0) {
          el_01.highlights.forEach((el_02) => {
            if (el_02?.matched_tokens?.length >= 0) {
              el_02.matched_tokens.forEach((el_03) => {
                dataListArr.push(el_03)
              });
            }
          });
        }
      });
      dataListArr = dataListArr.map((el)=>{
        return el.toLowerCase().replace(",","").replace(".","")
      })
      dataListArr.forEach((el, ind, arr)=>{
          arr.forEach((el_01, ind_01)=>{
              if(JSON.stringify(el) === JSON.stringify(el_01) && ind !== ind_01){
                arr[ind] = ""
              }
          })

      })
    //   dataListArr = dataListArr.filter((el, ind, arr)=>{
    //       console.log(arr.indexOf(el, (arr.indexOf(el)+1)))
    //       return arr.indexOf(el, (arr.indexOf(el)+1)) === -1
    //   })
      return dataListArr
    }
  }
  formatSearchResult(res, self){
      const dataArr = []
    if (res?.hits?.length >= 1) {
          res.hits.forEach((el_01) => {
            if (el_01?.document) {
                dataArr.push({
                    summary:self.removeHTMLTags(el_01.document["Class description"]),
                    title: el_01.document["Class title"],
                    // imageSrc:el_01.document['image.src']
                })
            }
          });
          return dataArr
        }
  }
  formatFacets(res, self){
    const facets = res.facet_counts.map((el_01)=>{
      const obj = {
        fieldName: el_01.field_name,
        values: el_01.counts.map((el)=>{return el.value})
      }
      return obj
    })
    return facets
  }
  formatFilterStr(self){
    const filterObj = self.currentState.search.filterby
    let arr = Object.entries(filterObj)
    let filterArr = []
    if (Object.keys(filterObj).length>=1) {
      filterArr = arr.map((el)=>{
        return el[0]+":="+el[1]
      })
    }
    let filterStr = ""
    if(Array.isArray(filterArr) && filterArr.length >= 1){
      filterStr = filterArr.join("&&")
    }
    return filterStr
  }


  // render
  renderFilters(target, arr, self){
    const optionTemplate = `
    <option value="<<value>>"><<value>></option>`
    const selectTemplate = `
    <div class="TS__AC__fitlers__container__item" >
      <label for="select__<<field_name>>"><<field_name>></label>
      <select data-fieldName = "<<field_name>>" class = "TS__AC__fitlers__container__item__select" name="select__<<field_name>>" id="select__<<field_name>>">
      <option value="*" selected> --- </option>     
      <<options>>
        </select>
    </div>
    `
    let html = []
    if(Array.isArray(arr) && arr.length>=1){
      arr.forEach((el_01)=>{
        let select = selectTemplate.replace(/<<field_name>>/g, el_01?.fieldName)
        let optionsArr = []
        el_01?.values.forEach((el_02)=>{
          optionsArr.push(optionTemplate.replace(/<<value>>/g, el_02))
        })
        select = select.replace("<<options>>", optionsArr.join(""))
        select = select.replace(/<<field_name>>/g, el_01?.fieldName)
        html.push(select)
      })
    }
    target.innerHTML = html.join("")
  }
  renderDataList(target, arr, self) {
      const template = `<li><<match_token>></li>`
      if(Array.isArray(arr) && arr.length >= 1){
          const sorted = arr.sort((a,b)=>{return a.length - b.length})
          let html = ""
          sorted.forEach((el)=>{
            if(el){
                const list = template.replace('<<match_token>>', el)
                html = html + list
            }
          })
          target.innerHTML = html
      }
      else{
        target.innerHTML = ""
      }
  }
  renderInputValue(target, value, self){
      target.value = value
  }
  renderListDisplay(target, boolean, self){
      if(boolean){
          target.style.display = 'block'
      }else{
          target.style.display = 'none'
      }
  }
  renderSearchResult(target, arr, self){
      if(Array.isArray(arr) && arr?.length>0){
          const template = `
            <div class="TS__AC__results__container__grid__card">
                <div class="TS__AC__results__container__grid__card__media">
                    <div class="TS__AC__results__container__grid__card__media__imgWrapper">
                        <img src = "<<imgSrc>>" class="TS__AC__results__container__grid__card__media__img">
                    </div>
                </div>
                <div class="TS__AC__results__container__grid__card__content">
                    <h4 class="TS__AC__results__container__grid__card__content__title"><<title>></h4>
                    <p class="TS__AC__results__container__grid__card__content__description"><<summary>></p>
                </div>
            </div>`
          let html = ''
          arr.forEach((el)=>{
              const card = template.replace('<<imgSrc>>', 'el.imageSrc').replace('<<title>>', el.title).replace('<<summary>>', el.summary)
              html = html + card
          })
          target.innerHTML = html
      }
      else{
        target.innerHTML = "<p>no results found. </p>"
      }
  }
  renderPageNum(target, self){
    const currentPage = self.currentState.response.currentPage
    const ttlPage = self.currentState.response.ttlPage
    target.innerText = `${currentPage}/${ttlPage}`
  }

  // query
  getFacets = async (self = this, ms = 100) => {
    let searchParameters = {
      q: "",
      query_by: "Class title,Class description",
      per_page: 0,
      limit_hits: 0,
      facet_by: self.initState.search.facets.join(","),
      max_facet_values:5,
    };
    const res = await client
      .collections("sgfitfam_classes_01")
      .documents()
      .search(searchParameters);
    console.log(res);
    return res;
  };
  getTokenByQuery = async (self = this, ms=1000) => {
    if (!self.limitQueryRate(ms, self)) {
      return `query over limited rate at ${ms}ms`;
    }
    if (!self.currentState.search.rawQuery) {
    //   console.log(`empty query`);
      return `empty query`;
    }
    let searchParameters = {
      q: self.currentState.search.rawQuery,
      query_by: "Class title,Class description",
      per_page: 10,
      limit_hits: 10,
      include_fields: "Class title",
    };
    const res = await client
      .collections("sgfitfam_classes_01")
      .documents()
      .search(searchParameters);
    console.log(res);
    self.setTSQuery(res, self);
    self.setMatchTokens(self.formatDataList(res, self), self)
    self.renderDataList(self.dataList, self.currentState.response.matchTokens, self )
    return res;
  };
  getDocByQuery = async (self = this, ms = 1500) => {
    if (!self.currentState.search.rawQuery) {
      return `empty query`;
    }
    let searchParameters = {
      q: self.currentState.search.rawQuery,
      query_by: "Class title,Class description",
      per_page: 6,
      limit_hits: 6,
      include_fields: "Class title,Class description",
    };
    const res = await client
      .collections("sgfitfam_classes_01")
      .documents()
      .search(searchParameters);
    console.log(res);
    return res;
  };
  getDocByFilter = async(self = this, ms = 500) =>{
    const filterStr = self.formatFilterStr(self)
    let searchParameters = {
      q: self.currentState.search.rawQuery,
      query_by: "Class title,Class description",
      filter_by:filterStr,
      per_page: self.currentState.search.hitsPerPage,
      page:self.currentState.search.getPage,
      limit_hits: 100,
      include_fields: "Class title,Class description",
    };
    const res = await client
      .collections("sgfitfam_classes_01")
      .documents()
      .search(searchParameters);
    console.log(res);
    self.setCurrentPage(res, self)
    self.setTotalPage(res, self)
    return res;
  }
  // set State
  setGetPage(value, self){
    if(value){
      self.currentState.search.getPage = value
    }
    return self.currentState.search.getPage
  }
  setCurrentPage(res, self){
    if(res?.page){
      self.currentState.response.currentPage = res.page
    } else {
      self.currentState.response.currentPage = 1
    }
    return self.currentState.response.currentFilter
  }
  setTotalPage(res, self){
    if(res?.found){
      const totalHits = res.found
      const perPage = self.currentState.search.hitsPerPage
      const ttlPage = Math.ceil(totalHits/ perPage)
      self.currentState.response.ttlPage = ttlPage
    }
  }
  setFilterBy(obj, self){
    const keys = Object.keys(obj)
    keys.forEach((el_01)=>{
        self.currentState.search.filterby[el_01] = obj[el_01]
    })
    // remove value "*" key value pairs
    const currentFilter = self.currentState.search.filterby
    Object.entries(currentFilter).forEach((el)=>{
      if(el[1] === "*"){
        delete currentFilter[el[0]]
      }
    })
  }
  setIsListOpen(boolean, self, handler = ""){
    const closeDataList = (e)=>{
      if(e.target !== self.dataList){
        self.setIsListOpen(false, self)
        self.renderListDisplay(self.dataList, false, self)
        document.removeEventListener('click', closeDataList)
      }
    }
    if(boolean === true){
      self.currentState.search.isListOpen = boolean;
      document.addEventListener('click',closeDataList)
    }
    // if(boolean === false){
    //   console.log('remove')
    //   document.removeEventListener('click', closeDataList)
    // }
  }
  setRawQuery(value, self) {
    self.currentState.search.rawQuery = value;
  }
  setTSQuery(res, self) {
    self.currentState.response.tsQuery = res.request_params.q;
  }
  setMatchTokens(arr, self){
    self.currentState.response.matchTokens = arr
  }
  // composition
  textInputCompo = async (event, self = this) => {
    if (event.target.value === self.currentState.search.rawQuery) {
      return;
    }
    if (event.target.value !== self.currentState.search.rawQuery) {
      self.setRawQuery(event.target.value, self);
      self.setIsListOpen(true, self)
      self.renderListDisplay(self.dataList,self.currentState.search.isListOpen, self)
      const res = await self.getTokenByQuery(self);
    }
  };
  dataListCompo(e, self){
      self.setRawQuery(e.target.innerText, self)
      self.renderInputValue(self.textInput, self.currentState.search.rawQuery, self)
      self.setIsListOpen(false, self)
      self.renderListDisplay(self.dataList,self.currentState.search.isListOpen, self)
      self.submitSearchCompo(e, self, 800)
  }
  recursiveInputCompo = async (target = self.textInput, self = this) => {
    if (target.value === self.currentState.response.tsQuery) {
    //   console.log("same query");
    }
    if (target.value !== self.currentState.response.tsQuery) {
    //   console.log("new query" + " " + self.currentState.search.rawQuery);
      self.setRawQuery(target.value, self);
      const res = await self.getTokenByQuery(self);
    }
    setTimeout(
      self.recursiveInputCompo,
      1500,
      (target = self.textInput),
      (self = this)
    );
  };
  submitSearchCompo = async (event, self = this, ms = 800)=>{
      if (!self.limitQueryRate(ms, self)) {
          return `query over limited rate at ${ms}ms`;
        }
      const res = await self.getDocByFilter(self)
      self.renderSearchResult(self.searchResults, self.formatSearchResult(res, self), self)
      self.renderPageNum(self.pageNum, self)
  }
  setFiltersCompo = async(self = this, ms = 100)=>{
    const res = await self.getFacets(self, ms)
    const facets = self.formatFacets(res)
    self.renderFilters(self.filters, facets, self)
    self.listenToElm(self.filters, self.getByFilterCompo, self, "change")
  }
  getByFilterCompo = async(event, self = this, ms = 100)=>{
    if(event.target.value && event.target.dataset){
      let obj = {}
      obj[event.target.dataset.fieldname] = event.target.value
      self.setFilterBy(obj, self)
      self.setGetPage(1, self)
      const res = await self.getDocByFilter(self, 400)
      self.renderSearchResult(self.searchResults, self.formatSearchResult(res, self), self)
      self.renderPageNum(self.pageNum, self)
    }
  }
  pageLRCompo(e, self){
    e.preventDefault()
    const value = e.target.dataset.value
    const currentPage = self.currentState.response.currentPage
    const ttlPage = self.currentState.response.ttlPage
    if(value === 'left'){
      if(currentPage>1){
        self.setGetPage(currentPage - 1, self)
        self.submitSearchCompo("",self, 300)
        }
    }
    if(value === 'right'){
      if (currentPage<ttlPage){
            self.setGetPage(currentPage + 1, self)
            self.submitSearchCompo("",self, 300)
        }
    }
  }
  initSearchCompo = async(self)=>{
    const res = await self.getDocByFilter(self)
      self.renderSearchResult(self.searchResults, self.formatSearchResult(res, self), self)
      self.renderPageNum(self.pageNum, self)
  }

  // mount
  mount = async (self) => {
    self.listenToElm(self.textInput, self.textInputCompo, self, "input");
    self.listenToElm(self.dataList, self.dataListCompo, self, "click");
    self.setFiltersCompo(self, 100)
    self.recursiveInputCompo(self.textInput, self);
    self.listenToElm(self.searchBtn, self.submitSearchCompo, self, "click")
    self.listenToElm(self.pageBtnPrev, self.pageLRCompo, self, "click")
    self.listenToElm(self.pageBtnNxt, self.pageLRCompo, self, "click")
    self.initSearchCompo(self)
    
  };
  // init
  init = async (self = this) => {
    self.mount(self);
  };
}

const acBox = new TS_AC
acBox.init()