export {HtmlWriter} from './en_html.js'
export { 
    ArHtmlWriter,
    CSS_value_en,
    CSS_str_en,
} from './ar_html.js'

export function maybe_hyphenated(id) {
    if(HYPHENATED.includes(id)) {
        return id.replaceAll('_','-')
    } else {
        return id
    }  
}    