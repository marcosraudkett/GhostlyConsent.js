/**
 *  GhostlyConsent.js 2021 - 2022
 *  v2.1.0
 *
 *  @author Marcos Raudkett 2021 - 2022
 *  @license MIT (https://opensource.org/licenses/MIT)
*/
let ghostlyConsent = {
  _events: [],
  _state: null,
  _config: {
    _debug: false,
    _destroy: false,
    _data: null,
    _register: false,
    _ajax: false,
    _isModal: false,
    _useStorage: false,
    _length: 365,
    _text: {
      acceptSelected: 'Accept selected',
      acceptAll: 'Accept all',
      declineAll: 'Decline all',
      personalize: 'Personalize',
      choose: 'Choose the cookies you wish to accept:',
    },
    _elements: {
      consentWrapper: '#gh-cookie-consent',
      personalizeWrapper: '#gh-cookie-personalization',
      modalWrapper: '#gh-modal',
      buttonsPersonalize: '#gh-cookie-personalize',
      buttonsEnable: '#gh-cookie-enable',
      buttonsDecline: '#gh-cookie-decline',
      buttonsClose: '.gh-close'
    },
    _template: {
      _isReady: false,
      _isLoading: false,
      _content: '',
      _useTemplate: false,
      _location: window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/views/',
      _template: 'default.html'
    },
    _cookie: '_ghostly_consent',
    _path: '.'+window.location.host,
    _callback: null,
    _style: '',
    _method: 'GET',
  },
  /**
   * Array of files/apps to load
   */
  _files: [],
  _files_original: [],

  /**
   * Initialize Ghostly
   * @param {*} options 
   */
  init: function(options = null, files = null, callbacks = null) {
    var _this = this;
    this.setOptions(options, files); // set user defined options

    if (this._config._template._useTemplate) {
      this.addEvent('templateLoad', true);
      ghostlyConsent.on('templateLoad', () => {}); 
    } 

    if (this._config._template._useTemplate && this._config._template._isReady || document.querySelector(this._config._elements.consentWrapper)) {
      this.bindEvents(); // bind clicks and other misc events
      if (this.get(this._config._cookie) == 'true') {
        if (this.get('_ghostly_files')) {
          this.load(JSON.parse(this.get('_ghostly_files')));
        } else {
          this.set(JSON.stringify(this._files), '_ghostly_files');
          this.load();
        }
      } // check cookie value for loading files
      // check if cookie isset (if not then display banner, if yes then do nothing)
      if (!this.check()) { this.display(true); } else { if (this._config._destroy) { this.destroy(); } } 

      // event 
      this.addEvent('initialized', true);
    }

    this.register(); // register Ghostly (for analytical purposes)

    return new Promise(function (resolve, reject) {
        _this.ready(resolve, reject);
    });

    return Promise.resolve(true);
  },

  /**
   * Checks if Ghostly is ready
   */
  ready: function(resolve, reject) {
    if(this._state) {
      resolve();
    }
  },

  /**
   * Get cookie
   * @param {*} name 
   */
  get: function(name) {
    if(!name) { name = this._config._cookie; }
    if (this._config._useStorage)
    {
      var cname = localStorage.getItem(name);
      return cname;
    } else {
      let cname = name + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(cname) == 0) {
          return c.substring(cname.length, c.length);
        }
      }
    }
    return "";
  },

  /**
   * Create cookie
   * @param {bool} value 
   */
  set: function(value, name = null) {
    if (name) { name = name; } else { name = this._config._cookie; } 
    var now = new Date();
    var time = now.getTime();
    if(!this._length) {
      var expireTime = time + 1000*22620000;
    } else {
      Date.prototype.addDays = function(length) 
    {
      var e = new Date(this.valueOf());
      e.setDate(e.getDate() + this._length);
      return e;
    }
      var e = new Date();
      var expireTime = e.addDays(this._length);   
    }
    now.setTime(expireTime);
    if (this._config._useStorage) {
      localStorage.setItem(name, value);
    } else {
        document.cookie = name+'='+value+'; expires='+now.toGMTString()+';domain='+this._config._path+';path=/';
    }
  },

  /**
   * Enable Ghostly
   * @param {bool} value 
   */
  enable: function(value) {
    this.set(value);
    if(value) {
      this.addEvent('accepted', true); this.addEvent('rejected', false);
      // only load if accepted
      if(this.get('_ghostly_files')) {
        this.load(JSON.parse(this.get('_ghostly_files')));
      } else {
        this.set(JSON.stringify(this._files), '_ghostly_files');
        this.load();
      }
    } else {
      this.addEvent('accepted', false); this.addEvent('rejected', true);
    }
    this.display(false);
    if(this._config._destroy) { this.destroy(); }

    // event 
    this.addEvent('status', value);
  },

  /**
   * Destroy Ghostly
   * @param {bool} value 
   */
  destroy: function() {
    var consentWrapper = document.querySelector(this._config._elements.consentWrapper);
    if(consentWrapper) {
      consentWrapper.parentNode.removeChild(consentWrapper);
    } else {
      this.error('consentWrapper not specified/found.');
    }
  },

  /**
   * Personalize
   * @param {array} files 
   */
  personalize: function(files) {
    var consentWrapper = document.querySelector(this._config._elements.consentWrapper);
    var personalizeWrapper = document.querySelector(this._config._elements.personalizeWrapper);
    var buttonsEnable = document.querySelector(this._config._elements.buttonsEnable);
    var buttonsPersonalize = document.querySelector(this._config._elements.buttonsPersonalize);
    if(files) {
      this._files = [];
      if(!consentWrapper.classList.contains("personalize")) {
        consentWrapper.classList.add('personalize');
        consentWrapper.setAttribute("style","height:100%;display:block;");
        if(personalizeWrapper) { 
          if(buttonsEnable) {
            buttonsEnable.innerText = this._config._text.acceptSelected;
          }

          personalizeWrapper.setAttribute("style","display:block;"); personalizeWrapper.innerHTML = ''; 
          personalizeWrapper.classList.add("active");
          
          // build checkboxes
          var h1 = document.createElement('h1');
          h1.innerText = this._config._text.choose;
          personalizeWrapper.appendChild(h1);

          files.forEach((file, index) => {
            if(Array.isArray(file)) {
              // search for meta scope
              var meta = this.search('meta', file);
              if(file && !file.scope) {
                arrayFiles = [];
                checkboxValue = '';
                file.forEach((nested_file, index) => {
                  arrayFiles.push(nested_file);
                  checkboxValue = nested_file.name;
                });

                var row = document.createElement('div');
                row.classList = 'row mt-1 mb-1';
                row.id = this.guidGenerator();
                personalizeWrapper.appendChild(row);

                var row = document.getElementById(row.id);

                var checkbox = this.checkbox(meta.name);
                row.appendChild(checkbox.checkbox);

                var label = document.createElement('label');
                if(meta.title) {
                  label.innerHTML = meta.title;
                } else {
                  label.innerHTML = file.file;
                }
                label.setAttribute('for', checkbox.id);
                row.appendChild(label);

                row.addEventListener('change', function(eventObj) { ghostlyConsent.consentChange(JSON.stringify(file), checkbox) });
              }
            } else {
              personalizeWrapper.classList.remove("active");

              var row = document.createElement('div');
              row.classList = 'row mt-1 mb-1';
              row.id = this.guidGenerator();
              personalizeWrapper.appendChild(row);

              var row = document.getElementById(row.id);
                
              var checkbox = this.checkbox(file.name);
              row.appendChild(checkbox.checkbox);

              var label = document.createElement('label');
              if(file.title) {
                label.innerHTML = file.title;
              } else {
                label.innerHTML = file.file;
              }
              label.setAttribute('for', checkbox.id);
              row.appendChild(label);

              row.addEventListener('change', function(eventObj) { ghostlyConsent.consentChange(JSON.stringify(file), checkbox) });
            }
          });
        }

        // event 
        this.addEvent('personalize', true);
      } else {
        if(buttonsEnable) {
          buttonsEnable.innerText = this._config._text.acceptAll;
        }
        consentWrapper.classList.remove('personalize');
        consentWrapper.setAttribute("style","display:block;");
        if(personalizeWrapper) { personalizeWrapper.setAttribute("style","display:none;"); personalizeWrapper.innerHTML = ''; }
        
        // event 
        this.addEvent('personalize', false);
        this._files = this._files_original;
      }
    } else {
      buttonsPersonalize.setAttribute('style', 'display:none;');
      // event 
      this.addEvent('personalize', null);
    }
  },

  checkbox: function(file) {
    var id = this.guidGenerator();
    var checkbox = document.createElement('input');
    checkbox.classList = 'ghostly-checkbox';
    checkbox.id = id; 
    checkbox.type = 'checkbox'; 
    if(file.file) {
      checkbox.value = file.file; 
    } else {
      checkbox.value = file; 
    }
    return {
      'id': id,
      'checkbox': checkbox
    };
  },

  /**
   * Check if cookie isset
   * @returns bool
   */
  check: function() {
    var cookie = this.get(this._config._cookie);
    if(cookie == '') {
      return false
    } else {
      if(cookie == 'false' || cookie == 'true') {
        return true;
      }
    }
  },

  /**
   * Display ghostly
   * @param {string} value - ghostly element wrapper
   */
  display: function(value) {
    var consentWrapper = document.querySelector(this._config._elements.consentWrapper);
    if(consentWrapper) {
      if(value) {
        this.addEvent('popupOpened', true); this.addEvent('popup', true);
        consentWrapper.setAttribute("style","display:block;");
      } else {
        this.addEvent('popupClosed', true); this.addEvent('popup', false);
        consentWrapper.setAttribute("style","display:none;");
      }
    } else {
      this.error('"'+this._config._elements.consentWrapper+'" wrapper was not found.', 'display');
    }
  },

  /**
   * Set Ghostly options
   * @param {array} options - options
   */
  setOptions: function(options = null, files = null) {
    if(options) { 
      if(typeof options.elements !== 'undefined') {
        for (const [key, value] of Object.entries(options.elements)) {
          if(this._config._elements.hasOwnProperty(key)) {
            this._config._elements[key] = value;
          } else {
            this.error('Option "'+key+' = '+value+'" is invalid.', 'setOptions');
          }
        };
      }

      if(typeof options.name !== 'undefined') { this._config._cookie = options.name; } 
      if(typeof options.domain !== 'undefined') { this._config._path = options.domain; } 
      if(typeof options.style !== 'undefined') { this._config._style = options.style; } 
      if(typeof options.register !== 'undefined') { this._config._register = options.register; } 
      if(typeof options.path !== 'undefined') { this._config._path = options.path; } 
      if(typeof options.ajax !== 'undefined') { this._config._append = options.ajax; } 
      if(typeof options.callback !== 'undefined') { this._config._callback = options.callback; } 
      if(typeof options.length !== 'undefined') { this._config._length = options.length; } 
      if(typeof options.debug !== 'undefined') { this._config._debug = options.debug; } 
      if(typeof options.isModal !== 'undefined') { this._config._isModal = options.isModal; } 
      if(typeof options.destroy !== 'undefined') { this._config._destroy = options.destroy; } 
      if (typeof options.storage !== 'undefined') { this._config._useStorage = options.storage; }
      if (typeof options.template !== 'undefined') { this._config._template._template = options.template; }
      if (typeof options.templateLocation !== 'undefined') { this._config._template._location = options.templateLocation; } 
      if (typeof options.useTemplate !== 'undefined') { this._config._template._useTemplate = options.useTemplate; }

      if(typeof options.text !== 'undefined') {
        for (const [key, value] of Object.entries(options.text)) {
          if(this._config._text.hasOwnProperty(key)) {
            this._config._text[key] = value;
          } else {
            this.error('Option "'+key+' = '+value+'" is invalid.', 'setOptions');
          }
        };
      }
    }

    if(files) {
      this._files = [];
      for (const [key, value] of Object.entries(files)) {
        this._files.push(value);
      };

      this._files_original
      for (const [key, value] of Object.entries(files)) {
        this._files_original.push(value);
      };
    }

    this._state = true;
  },

  /**
   * BindEvents
   */
  bindEvents: function() {
    invalid = [];
    for (const [key, value] of Object.entries(this._config._elements)) {
      const element = document.querySelector(value);
      switch(key) {
        case 'buttonsEnable': if(element) { element.addEventListener('click', function() { ghostlyConsent.enable(true) }); element.innerText = this._config._text.acceptAll; } else { invalid.push(value) } break;
        case 'buttonsDecline': if(element) { element.addEventListener('click', function() { ghostlyConsent.enable(false) }); element.innerText = this._config._text.declineAll; } else { invalid.push(value) } break;
        case 'buttonsPersonalize': if(element) { element.addEventListener('click', function() { ghostlyConsent.personalize(files) }); element.innerText = this._config._text.personalize; } else { invalid.push(value) } break;
        case 'buttonsClose': if(element) { element.addEventListener('click', function() { ghostlyConsent.display(false) }); }  break;
      }
    }

    // errors
    invalid.forEach((value, index) => {
      this.error('Failed to bind event to: '+value);
    });
  },

  /**
   * Load files
   */
  load: function(files = null) {
    if(files) { this._files = files; }
    loaded = {};
    loaded.files = [];
    this._files.forEach((file, index) => {
      if(!file.disallowed) {
        if(Array.isArray(file)) {
          // search for permissions scope
          var permissions = this.search('permissions', file);
          // search for meta scope
          var meta = this.search('meta', file);
          // check if permissions are there
          if(!permissions.disallowed && typeof permissions !== 'undefined') {
            file.forEach((nested_file, index) => {
              // if nested file is disallowed
              if(!nested_file.disallowed) {
                if(nested_file && !nested_file.scope) {
                  loaded.files.push(nested_file);
                  if(!nested_file._ajax && nested_file.type) {
                    // add file to page
                    if(!this._config._ajax) {
                      this.appendFile(nested_file);

                      // event 
                      this.addEvent('appendFile', nested_file);
                    }
                  } else {
                    // load file
                    this.getFile(nested_file);

                    // event 
                    this.addEvent('getFile', nested_file);
                  }
                }
              }
            });
          }
        } else {
          loaded.files.push(file);
          // add file to page
          if(!this._config._ajax && !file.ajax && file.type) {
            this.appendFile(file);

            // event 
            this.addEvent('appendFile', file);
          } else {
            // load file with xhr
            this.getFile(file);

            // event 
            this.addEvent('getFile', file);
          }
        }
      }
    });

    // callback
    if(this._config._callback) {
      this.sendCallback(this._config._callback, loaded);
    }

    // event 
    this.addEvent('filesLoaded', this);
  },

  /**
   * Load file using XMLHttpRequest();
   * @param {*} file 
   */
  getFile: async function(file) {
    var xhttp = new XMLHttpRequest();
    if(file.method) {
      xhttp.open(file.method, file.file, true);
    } else {
      xhttp.open(this._config._method, file.file, true);
    }
    xhttp.send();
    xhttp.onreadystatechange = function () {
      return xhttp.responseText;
    }
  },

  loadTemplate: async function() {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', `${this._config._template._location}`, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        ghostlyConsent._config._template._content = xhttp.responseText;
        ghostlyConsent.addEvent('templateLoaded', true);
        ghostlyConsent._config._template._isReady = true;
        ghostlyConsent.appendFile({ file: xhttp.responseText, type: 'template' })
        return xhttp.responseText;
      }
    }
  },

  getTemplate: function() {
    return this.loadTemplate();
  },

  /**
   * Append file to page
   * @param {*} file 
   */
  appendFile: function(file) {
    if(file.type) {
      switch(file.type) {
        default:
        case "js":
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = file.file;    
          document.head.appendChild(script);
        break;

        case "css":
          var link = document.createElement('link');
          link.setAttribute('rel', 'stylesheet');
          link.setAttribute('href', file.file);
          document.head.appendChild(link);
        break;

        case "template": // used for templates
            if (this._config._template._isReady && this._config._template._content) {
              var element = document.getElementsByTagName("ghostly");
              if (element.length == 0) { // only allow one template to be loaded
                var template = document.createElement('ghostly');
                template.innerHTML = file.file;
                document.body.appendChild(template);
                setTimeout(() => {
                  ghostlyConsent.init();
                }, 100);
              }
            }
        break;
      }
    } else {
      this.error('Missing file "type":');
      this.error(file);
    }
  },

  /**
   * Send data using XMLHttpRequest();
   * @param {*} file 
   */
   sendCallback: function(url, data) {
    var xhttp = new XMLHttpRequest();
    var data = JSON.stringify(data);
    xhttp.open('POST', url, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(data);
  },

  /**
   * Search for a key in array
   * @param {*} key 
   * @param {*} array 
   * @returns array
   */
  search: function(key, array) {
      for (var i=0; i < array.length; i++) {
          if (array[i].scope === key) {
              return array[i];
          }
      }
  },

  /**
   * id generator
   * @returns string
   */
  guidGenerator() {
    var S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  },

  /**
   * Throws error to console
   * @param {string} title 
   * @param {string} text 
   */
  error: function(text, component = null) {
    if(component) {
      console.log('%c GhostlyConsent.js - '+component+': '+text, 'background: #151515; color: #ff304d');
      if(this._config._debug) { alert('GhostlyConsent.js - '+component+': '+text); }
    } else {
      console.log('%c GhostlyConsent.js - '+text, 'background: #151515; color: #ff304d');
      if(this._config._debug) { alert('GhostlyConsent.js - '+text); }
    }

    this.addEvent('error', text);
  },

  /**
   * Wait then document is ready
   * @param {*} fn 
   */
  document_ready: function(fn) {
      if (document.readyState === "complete" || document.readyState === "interactive") {
          setTimeout(fn, 1);
      } else {
          document.addEventListener("DOMContentLoaded", fn);
      }
  },    

  /**
   * Register Ghostly (disabled by default)
   * For analytic purposes (only sends the hostname)
   */
   register: function() {
    if(this._config._register) {
      // check if registered
      if(!this.get('_ghostly_register')) {
        var app = document.location.hostname;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              this.set(true, '_ghostly_register');
            }
        };
        xhttp.open("GET", "https://api.marcosraudkett.com/register?source="+app+"&app=ghostlyConsent.js", true);
        xhttp.send();
      }
    }
  },

  /**
   * When a checkbox has been checked (this will remove or add to the list of files to load)
   * @param {array} file 
   * @param {array} element 
   */
  consentChange: function(file, element) {
    this._files_consent = [];
    var file = JSON.parse(file);
    if(this._files.length > 0) {
      exists = false;
      this._files.forEach((file_, index) => {
        if(Array.isArray(file)) {
          exists = false;
          var meta = this.search('meta', file_);
          if(element.checkbox.checked) {
            if(meta.name == element.checkbox.defaultValue) {
              exists = true;
            }
            if(!exists) { this._files.push(file); }
          } else {
            if(meta.name == element.checkbox.defaultValue) {
              // remove
              this._files.splice(index, 1); 
            }
          }
        } else {
          exists = false;
          if(element.checkbox.checked) {
            if(file_.name == element.checkbox.defaultValue) {
              exists = true;
            }
            if(!exists) { this._files.push(file); }
          } else {
            if(file_.name == element.checkbox.defaultValue) {
              // remove
              this._files.splice(index, 1);
            }
          }
        }

        exists = false;
      });
    } else {
      this._files.push(file);
    }

  },

  /**
   * Add event to pool
   * @param {*} event 
   * @param {*} value 
   */
  addEvent: function(event, value) {
    this._events.push({
      'event': event,
      'value': value
    });

    setTimeout(() => {
      if (event == 'initialized') {
        var buttonsPersonalize = document.querySelector(this._config._elements.buttonsPersonalize);
        if (!this._files.length > 0) {
          buttonsPersonalize.remove();
        }
      }
    }, 100);
  },

  /**
   * Events
  */
  on: function(state, callback) {
    var events = this._events;
    setInterval(function() {
      if(events.length > 0) {
        events.forEach((event, index) => {
          if(state == event.event) { 
            events.splice(index, 1); 
            callback(event); 
          }

          
          if (event.event == "templateLoad" && !ghostlyConsent._config._template._isLoading)  {
            ghostlyConsent.getTemplate();
            ghostlyConsent._config._template._isLoading = true;
            events.splice(index, 1); 
          }
        });
      }
    }, 100);
  },

  /* API */

  /**
   * API - add files to personalize
   * @param {*} event 
   * @param {*} value 
   */
  addFiles: function(files) {
    this.addEvent("addFiles", true);
    if(Array.isArray(files)) {
      if(files.length > 0) {
        this._files = files;
      } else {
        this.error('addFiles array cannot be empty.');
      }
    } else {
      this.error('addFiles expected an array.');
    }
  },

  /**
   * API - add a single file
   * @param {*} event 
   * @param {*} value 
   */
  addFile: function(file) {
    this.addEvent("addFile", true);
    if(!Array.isArray(file)) {
        this._files.push(file);
    } else {
      this.error('addFile expected an object. but got array instead');
    } 
  },

  /**
   *  API - get files
   */
  getFiles: function() {
    return this._files;
  },

}