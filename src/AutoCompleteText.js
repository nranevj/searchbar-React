import React, {Component} from 'react';
import "./AutoCompleteText.css";
import axios from 'axios';

class AutoCompleteText extends Component{
    constructor(props){
        super(props)
        this.state = {
            suggestions : [],
            text: '',
            history: {},
            hideResults: false
        } 
    }

// Makes API call to fetch JSON data when the application loads
componentDidMount(){
    axios.get('https://raw.githubusercontent.com/nranevj/searchbar-React/master/products.json')
    .then(response => {
        let allsuggestions = response.data.products.map((key) => {
            return key;
        })

        // Filtering duplicates
        allsuggestions = Array.from(new Set(allsuggestions.map(x => x.name)))
        .map(name =>{
            return allsuggestions.find(x => x.name === name);
        })

        this.setState(() => ({
            allsuggestions,
            text: ''
        })) 
    })
    .catch(error => {
        console.log(error);
    })
}

// Called whenever the user enters or removes a character from the searchbox
onTextChange = (event) => {
    const value = event.target.value;
    let suggestions = [];

    if(value.length > 0){
        const regex = new RegExp(`^${this.regexcompatible(value)}`,'i');
        suggestions = [...this.state.allsuggestions];        
        
        //Filtering data based on user input
        suggestions = suggestions.filter(function(key){
            return regex.test(key.name);
        });

        // Taking top 10 autocomplete suggestions
        suggestions = suggestions.slice(0,10);

        // Removing unnecessary character(-), and capitalize first character of every word
        // for example: "CREDIT_CARD" to "Credit Card"  
        for(let i=0;i<suggestions.length;i++){
            let temp = suggestions[i].type.split("_");
    
            for(let j=0;j<temp.length;j++){
                temp[j] = temp[j].toLowerCase();
                temp[j] = temp[j].charAt(0).toUpperCase() + temp[j].slice(1);
            }
            suggestions[i].type = temp.join(" ");
        }

        // Removing unnecessary data from 'name' attribute (if present) from '-' onwards
        suggestions = suggestions.filter(function(key){
            key.name = key.name.replace(/\s+-\s+[a-z].*?$/ig,'');
            return key.name;
        });

        // Organizing (Sorting) autocomplete suggestions by 'type'
        suggestions = suggestions.sort(function(a,b){
            let ptype = a.type.toLowerCase(), p2type = b.type.toLowerCase();
            if(ptype < p2type)
                return -1;
            if(ptype > p2type)
                return 1;
            return 0;
        });
    }
    this.setState(() => ({ 
        suggestions, 
        text: value,
    }));
}

// Populating the searchbox with the selected value from the suggestions
// Storing the selected value as user's history
suggestionsSelected(value){
    const key = value.name + value.type;
    this.state.history[key] = value;

    this.setState(() => ({
        text: value.name,
        suggestions: []
    }));
}

/*
Mention this in the element you want to apply to : onFocus = {this.onFocus} onBlur = {this.onBlur}

onBlur = () => {
    this.setState(() => ({
        hideResults: true
    }));
}

onFocus = () => {
    this.setState({
        hideResults: false
    });
}
*/

// To make all characters regex compatible
regexcompatible(string){
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Removing the suggestion from user's history
removeHistoryItem(item){
    delete this.state.history[item];
    this.setState({
        history : this.state.history
    });
}

// Will render Autocomplete Suggestions or History suggestions
renderSuggestion (){
    const {hideResults, suggestions}  = this.state;

    if(!hideResults && this.state.text.length > 0){
        if(suggestions.length === 0){
            return null;
        }
        if(suggestions.length !== 0){
            return(
        <div className="parent">   
            <p className="searchsuggestion"> Search suggestions </p>
            <ul>
                {suggestions.map((item,i) => 
                <a href={item.url} target="_blank" rel="noopener noreferrer" tabIndex= {i+2} key = {i} className = "resultcontent"><p onClick={() => this.suggestionsSelected(item)}>{this.state.text}<b>{item.name.replace(new RegExp(this.regexcompatible(this.state.text),'i'),'')}</b><span style={{color : 'grey'}}> in </span> <span style={{color : 'blue'}}>{item.type}</span></p></a>
                )}
            </ul> 
        </div>
            );
        }
    }
    else if(!hideResults){
        const history = this.state.history;
        if(Object.keys(history).length === 0){
            return null;
        }
        if(Object.keys(history).length !== 0){
            return(
        <div className="parent">   
            <ul>
                {Object.keys(history).map((item,i) =>
                <p key = {i}><a href={history[item].url} target="_blank" rel="noopener noreferrer" className = "resultcontent" onClick={() => this.suggestionsSelected(history[item])}>{history[item].name} <span style={{color : 'grey'}}> in </span><span style={{color : 'blue'}}>{history[item].type}</span></a>
                <button className="remove" onClick = {() => this.removeHistoryItem(item)}>Remove</button></p>
                )}
            </ul> 
        </div>
            );
        }
    }
}

// Renders the search box
render(){
    const {text} = this.state;
    return(
        <div>      
            <input className = "inputStyle" value={text}  onChange = {this.onTextChange} type = "search"  placeholder= "Enter the product name"  />
            {this.renderSuggestion()}
        </div>
    )
  }
}

export default AutoCompleteText;
