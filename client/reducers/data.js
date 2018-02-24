const initialData = ["chrome","edge","firefox","ie","opera","safari","webview_android","chrome_android","edge_mobile","firefox_android","opera_android","safari_ios","samsunginternet_android","nodejs","bc-has-history","ie_mobile"].reduce((obj, key) => {
  obj[key] = "Yes";
  return obj;
}, {});

export default function (state={data: initialData}, action) {
  switch(action.type) {
    case 'INIT':
      // only called when the textbox is empty again
      // returns all the compatibilities back to 'Yes'
      let newData = {...state.data}
      Object.keys(state.data).forEach((key) => {
        newData[key] = "Yes";
      })
      return {...state, data: newData};

    case 'UPDATE_DATA':
      // update data determines the new level of compatibility
      // logic could probably be cleaned up but be careful...
      if(typeof action.payload !== 'object'){
        return state;
      }
      let oldData = {...state.data};

      Object.keys(oldData).forEach((key) => {
        let lowest;
        switch(action.payload[key]) {
          case "Yes":
            lowest = oldData[key];
            break;
          case "No":
            lowest = "No";
            break;
          case "?":
            if(oldData[key] === "No"){
              lowest = "No";
            }
            else {
              lowest = "?"
            }
            break;
          default:
            // we do not know oldData
            // however we do know that the new Data is either undefined, a number, or something weird
            // but we know that the payload is a number of weird character
            if(!action.payload[key] || isNaN(action.payload[key])){
              lowest = oldData[key];
            }
            // so now we know action.payload[key] is definitely a number
            // the only two options that can beat a number is "No" and "?"
            else if(isNaN(oldData[key])){
              if(oldData[key] === "No" || oldData[key] === "?"){
                lowest = oldData[key]
              }
              else {
                lowest = action.payload[key];
              }
            }
            // both HAVE to be numbers
            else {
              lowest = Math.max(parseInt(action.payload[key], 10), parseInt(oldData[key], 10)).toString();
            }
            break;
        }

        oldData[key] = lowest;
      })
      return {...state, data: oldData};

    default:
      return state;
  }
}
