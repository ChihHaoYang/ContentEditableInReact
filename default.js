// Array.prototype.findIndex polyfill
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function (predicate) {
            'use strict';
            if (this == null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        },
        enumerable: false,
        configurable: false,
        writable: false
    });
}

// Table Component
class ContentEditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cols: [
                { key: 'order', label: '順序' },
                { key: 'id', label: '代號' },
                { key: 'name', label: '名稱' }
            ]
        }
        this.emitChange = this.emitChange.bind(this);
    }

    render() {
        let headerComponents = this.generateHeaders(),
            rowComponents = this.generateRows();

        return (
            <table>
                <thead>{headerComponents}</thead>
                <tbody>{rowComponents}</tbody>
            </table>
        );
    }

    generateHeaders() {
        let cols = this.state.cols;

        return (
            <tr>
                {cols.map(colData => {
                    return <th key={colData.key}> {colData.label} </th>
                })
                }
            </tr>
        )
    }

    generateRows() {
        let cols = this.state.cols;
        let data = this.props.data;
        let emitChangeEvent = this.emitChange;

        return data.map(function(item, i) {
            let cells;
            cells = cols.map(function(colData, i) {
                switch(colData.key) {
                    case 'order':
                        return <td key={`${item.id}-${colData.key}`} ref={item.id} contentEditable onBlur={emitChangeEvent.bind(this, item.id)}>{item[colData.key]}</td>;
                    default:
                        return <td key={`${item.id}-${colData.key}`}> {item[colData.key]} </td>;
                }
            });
            return <tr key={`${item.id}-tr`}>{cells}</tr>;
        });
    }

    emitChange(id, e) {
        let html = ReactDOM.findDOMNode(this.refs[id]).innerText.trim();
        if (Number.isNaN(+html)) {
            ReactDOM.findDOMNode(this.refs[id]).innerText = '0';
            alert('Please input a number');
            return;
        }
        if (this.props.handleUpdate) {
            let newData = {};
            newData.id = id;
            newData.order = html;
            this.props.handleUpdate(newData);
        }
    }
}

class MainPage extends React.Component {
    constructor() {
        super();
        this.state = {
          data: [{
    			  'id': 't',
    			  'name': 'Tom',
    			  'order': 1
    			}, {
    			  'id': 'j',
    			  'name': 'John',
    			  'order': 20
    			}, {
    			  'id': 'a',
    			  'name': 'Alice',
    			  'order': 100
    			}, {
    			  'id': 'b',
    			  'name': 'Bob',
    			  'order': 200
    			}, {
    			  'id': 'c',
    			  'name': 'Cat',
    			  'order': 300
    			}
    			]
        }
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    componentDidMount() {
      // todo: fetch yout API & setState(data: data)
    }

    render() {
        return (
            <div>
                <ContentEditableTable data={this.state.data} handleUpdate={this.handleUpdate} />
            </div>
        );
    }

    // 給子元件拿來更新自己state的callback function
    handleUpdate(changedData) {
        if(!changedData) {
            return;
        }
        let data = this.state.data;
        let targetIndex = data.findIndex((element, index, array) => {
            return element.id == changedData.id;
        });

        if (data[targetIndex].order === +changedData.order) {
            return;
        }

        let needUpdateData = data[targetIndex];
        let updateId = changedData.id;
        let updateOrder = changedData.order;
        let updateDate = needUpdateData.joinDate;

        data[targetIndex].order = +changedData.order;

        // 要記得sort setState才會畫對更新後的順序
        data.sort((a,b) => {
            return a.order - b.order;
        })

        this.setState({data: data});

        // todo: fetch your API to update
    }
}

ReactDOM.render(<MainPage />, document.querySelector('#main'));
