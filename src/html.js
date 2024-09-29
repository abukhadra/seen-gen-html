import {write_html} from './en_html.js'
import { 
    write_ar_html,
    CSS_value_en,
    CSS_str_en,
} from './ar_html.js'

class HTMLGen {
    write_html
    write_ar_html
    CSS_value_en 
    CSS_str_en

    constructor() {
        this.write_html = write_html
        this.write_ar_html = write_ar_html
        this.CSS_value_en = CSS_value_en
        this.CSS_str_en = CSS_str_en    
    }
}


function maybe_hyphenated(id) {
    if(HYPHENATED.includes(id)) {
        return id.replaceAll('_','-')
    } else {
        return id
    }  
}    


export {HTMLGen , maybe_hyphenated}

