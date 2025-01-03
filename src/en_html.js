import { maybe_hyphenated } from './main.js'
import {BOOL_ATTRS} from './constants.js'
import  { 
    is_list,
    to_str,
    panic,
}  from '../lib/sutils.js'

class HtmlWriter {
    jsGen

    constructor(jsGen) {
        jsGen.init()
        this.jsGen = jsGen
        return this
    }
    write_html(el, page) {
        const stack = []
        switch(el.id) {
            case 'call' :  
                let tag = el.v[0].v.v[1]
                let attrs = el.v[1] || []
                let children = el.v[2] || []
                if(tag === 'Br') { return page += '<br>' }
                switch(tag) {
                    case 'Select': page = this.write_css(attrs, page) + '} '; break
                    case 'FontFace': page = this.write_css_fontface(attrs, page); break
                    case 'Keyframes': page = this.write_css_keyframes(attrs, children, page) ; break
                    default: 
                        stack.push(tag)
                        page += `<${tag}`
                        attrs.forEach((attr,i) => {
                            if(i === 0 && attr.id === 'str') {
                                page += ` id='${attr.v.v[1]}'`
                            } else if( attr.id === 'named_arg'){
                                // const attr_name = HTML_attr_en(attr.v[0].v[1])
                                const attr_name = attr.v[0].v[1]
                                if(BOOL_ATTRS.includes(attr_name)) {
                                    page += ` ${attr_name} `    
                                } else {
                                    page += ` ${attr_name}= `
                                    if(attr.v[1].id === 'str') {
                                        page += `'${attr.v[1].v.v[1]}'`
                                    } else if(attr.v[1].id === 'int' || attr.v[1].id === 'float') {
                                        const num = attr.v[1].v[0].v[1]
                                        const suffix = attr.v[1].v[1].v[1] || ''
                                        page += `${num}${suffix}`
                                    }  else if (attr.v[1].id === 'bool') {
                                        // page += `${HTML_attr_en(attr_name)}`
                                        page += `${attr_name}`

                                    } else { panic('not supported: ' + to_str(attr)) }         
                                }                       
                            } else {
                                panic('not supported: ' + to_str(attr))
                            }
                        })
                        page += '>'
                        children.forEach( c => { page = this.write_html(c , page)  })
                        stack.pop()
                        page += `</${tag}>`
                }
                break
            case 'str' : page += el.v.v[1] ; break
            default: panic('unknown html element: ' + to_str(el))
        }
        return page
    }

    write_css(attrs, page) {
        attrs.forEach( attr => { 
            const k = maybe_hyphenated(attr.v[0].v[1])
            const v = attr.v[1]
            if(k === 'element') {
                page = this.write_css_selector(v, page)
                page += ' {'
            } else {
                page += `${k} : `
                page = this.write_css_attr_value(v, page)
                page += `; `
            }
        })
        return page
    }

    write_css_selector(v, page) {
        if(is_list(v.v)) { 
            page += ' '
            v.v.forEach( (x, i) => {
                page += `${x.v.v[1]} ` 
                if(i < v.v.length - 1 ) { page +=','}
        }) 
        } else { 
            page += ` ${v.v.v[1]}`
        }
        return page
    }

    write_css_attr_value(v , page) {
        switch(v.id) {
            case 'int': 
            case 'float' : 
                const num = v.v[0].v[1]
                const suffix = (v.v[1] && v.v[1].v[1]) || ''
                page += num + suffix 
                break
            case 'prefix': 
                    page += v.v.op.v
                    page = this.write_css_attr_value(v.v.opr, page) 
                    break
            case 'postfix': 
                page = this.write_css_attr_value(v.v.opr, page) 
                page += v.v.op.v                        
                break
            case 'str': page += v.v.v[1]; break;
            case 'ref': page += maybe_hyphenated(v.v.v[1]); break;
            case 'tuple':   // FIXME: this depends on order, some things require order in css and others do not
                v.v.forEach(el =>  {
                    page = this.write_css_attr_value(el, page + ' ') 
                }) 
                break; 
            case 'call': 
                const ref = v.v[0].v.v[1]
                const args = v.v[1]                
                page += ` ${ref}(`
                args.forEach(arg => {
                    page = this.write_css_attr_value(arg, page)
                })
                page += `)`
                break
                case 'bin': 
                    this.jsGen.write_expr(v)
                    const code = this.jsGen.get_code()
                    page += '${' + code + '}'.trim() 
                    break
            default: panic(`not supported: html generations:  ${to_str(v)}` )
        }
        return page
    }

    write_css_fontface(attrs, page) {
        page += `@font-face { `    
        page = write_ar_css(attrs,page)
        page += '}'
        return page
    }


    write_css_keyframes(attrs, children ,page) {
        // FIXME we are not covering all the cases: 
            // attrs[0] is only for keyframes('id'), what if user passes keyframes(id: 'id')
        page += ` @keyframes ${attrs[0].v.v[1]} { `  
        children && children.forEach( c => {
            const ref = c.v[0].v.v[1]
            const v = c.v[1]
            switch (ref) {
                case 'at' : 
                    const percentage = v[0]
                    const attrs = v[1].v || [] 
                    page = this.write_css_attr_value(percentage, page)
                    page += ' {' 
                    attrs.forEach(attr => { 
                        if(attr.id === 'named_tuple') {
                            attr.v.forEach(el => {
                                const _k = maybe_hyphenated(el[0].v[1])
                                const _v = el[1]
                                page += ` ${_k} : `                            
                                page = this.write_css_attr_value(_v, page) 
                                page += `; `    
                            })
                        } else {
                            const _k = maybe_hyphenated(attr[0].v[1])
                            const _v = attr[1]                            
                            page += ` ${_k} : `                            
                            page = this.write_css_attr_value(_v, page) 
                            page += `; `
                        }
                    } ) 
                    page += '} '
                    break
                default : panic('unsupported element: ' + to_str(ref))
            }
        })
        page += '}'
        return page
    }
}
export {HtmlWriter}