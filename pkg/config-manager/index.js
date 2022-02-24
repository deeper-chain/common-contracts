module.exports = class ConfigManager {
  constructor () {
    this.store = {}
    this._cache = {}
    this._schema = []
  }
  
  schema (str) {
    if (str) this._schema = str.split('.')
    return this._schema
  }
  
  _fromSchema (env) {
    let names = this._schema.map(v => env[v] == null ? '*' : env[v])
    while (names.length > 1 && names[names.length - 1] === '*') {
      names.pop()
    }
    if (names.length === 0) return '*'
    return names.join('.')
  }
  
  set (desc) {
    this._cache = {}
    this._set(desc, undefined, undefined)
  }
  
  _set (desc, env, names) {
    if (env != null) {
      if (names != null) {
        this._write(desc, env, names)
        return
      }
      
      for (let [k, v] of Object.entries(desc)) {
        this._set(v, env, [k])
      }
      return
    }
    if (names != null) {
      if (Object.prototype.toString.call(desc) !== '[object Object]') {
        this._set(desc, '*', names)
        return
      }
      for (let [k, v] of Object.entries(desc)) {
        let theEnv = this._formEnv(k)
        if (theEnv !== false) {
          this._set(v, theEnv, names)
        } else {
          this._set(v, undefined, [...names, k])
        }
      }
      return
    }
    for (let [k, v] of Object.entries(desc)) {
      let theEnv = this._formEnv(k)
      if (theEnv !== false) {
        this._set(v, theEnv, undefined)
      } else {
        this._set(v, undefined, [k])
      }
    }
  }
  
  _write (desc, env, names) {
    let store = this.store
    
    store[env] = store[env] || {}
    let host = store[env]
    for (let i = 0; i < names.length; i++) {
      let name = names[i]
      if (i === names.length - 1) {
        host[name] = desc
      } else {
        host[name] = host[name] || {}
        host = host[name]
      }
    }
    
  }
  
  _formEnv (str) {
    if (str === '*') {
      return ['*']
    } else if (str.includes('.')) {
      let names = str.split('.')
      if (names.length !== this._schema.length) {
        return false
      }
      while (names.length > 1 && names[names.length - 1] === '*') {
        names.pop()
      }
      return names.join('.')
    } else {
      return false
    }
  }
  
  get (env) {
    if (typeof env === 'object') {
      env = this._fromSchema(env)
    }
    if (this._cache[env]) return this._cache[env]
    let names = env.split('.')
    
    let subEnvs = this._collect(names)
    
    let valueTable = Object.assign({}, ...subEnvs.map(v => this.store[v]))
    
    this._cache[env] = valueTable
    return valueTable
  }
  
  _collect (names) {
    let ret = this._collectRec(names)
    return ret.map(v => {
      if (v.length === 0) return '*'
      return v.map(v => v === undefined ? '*' : v).join('.')
    })
  }
  
  _collectRec (names) {
    while (names.length > 1 && names[names.length - 1] === '*') {
      names.pop()
    }
    if (names.length === 0) {
      return [[]]
    }
    let len = names.length
    let last = names.pop()
    let ret = this._collectRec(names)
    return ret.concat(ret.map(v => {
      let arr = []
      for (let i = 0; i < len; i++) {
        arr[i] = v[i]
      }
      arr[len - 1] = last
      return arr
    }))
  }
}
