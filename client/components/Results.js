import React from "react";
import PropTypes from 'prop-types';

const Results = (props) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Object.keys(props.data).map((key) => (<th key={`${key}head`}>{key}</th>))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.keys(props.data).map((key) => (<td key={`${key}body`}>{props.data[key]}</td>))}
          </tr>
        </tbody>
      </table>
    </div>
  )
};

Results.propTypes = {
  data: PropTypes.object
}

export default Results;
