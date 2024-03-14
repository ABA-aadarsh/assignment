import React, { useState, useEffect } from 'react';
import { Table, Checkbox, Button, Input } from 'antd';
import style from "./TableRenderer.module.css"
import MapRender from './MapRender';
const TableRenderer = () => {

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showTable,setShowTable]=useState(false)
  // for selecting columns
  const [geoData,setGeoData]=useState(null)
  const [selectedColumns, setSelectedColumns] = useState([]);// this will change as the user select or unselect checkboxes
  const [renderedColumns,setRenderedColumns]=useState([]) // this will change on when the user click the submit button
  // for search
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');

  // fetch('https://jsonplaceholder.typicode.com/users')
  // set data and columns from the above fetched data
  // then select the columns using checkboxes and click on submit button to diplay the data in the table


// Implement your own functions according to the usecase 

  const updateSelectedColumns=(columnName,action="add")=>{
    // here action will be add or delete, based on that we would either delete or add element in selectedColumns
    if(action=="add"){
      setSelectedColumns(prev=>{
        // since the address and company column are a bit tricky, using if else to make custom rendering for these two
        if(columnName==="address"){
          return [...prev,{
              title: columnName.toUpperCase(),
              key: columnName,
              dataIndex: columnName,
              render: (text, record) => (
                // here making a custom table data because we want to implement some functionality further
                <div
                  id={`record-addr-${record.id}`}
                  className={style.addrCell}
                >
                  <p>
                    {/* lets display city here  */}
                    <span>{record.address.city}</span>
                    <button
                      className={style.toggleBtn}
                      onClick={()=>{
                        const cell=document.querySelector(`#record-addr-${record.id}`)
                        const e=cell.querySelector(`.${style.list}`)
                        e.classList.toggle(style.hide)
                        if(e.classList.contains(style.hide)){
                          cell.querySelector("button").innerHTML="+"
                        }else{
                          cell.querySelector("button").innerHTML="-"
                        }
                      }}
                    >
                      +
                    </button>
                  </p>

                  {/* other address detail in this list */}
                  <div
                    className={[style.list,style.hide].join(" ")}
                  >
                    <div><span className={style.addrId}>Street</span> <span>{record.address.street}</span></div>
                    <div><span className={style.addrId}>Suite</span> <span>{record.address.suite}</span></div>
                    <div><span className={style.addrId}>Zipcode</span> <span>{record.address.zipcode}</span></div>
                    <div><span className={style.addrId}>Geo</span> <span>({record.address.geo.lat}, {record.address.geo.lng})</span></div>
                  </div>
                </div>
              )
            },
            {
              title: "Map",
              key:"map",
              dataIndex:"map",
              render: (text,record)=>(
                <Button
                  onClick={()=>{
                    setGeoData({
                    lat: record.address.geo.lat,
                    lng: record.address.geo.lng
                    })
                    // now scrolling to bottom of the page where we can see the map
                    window.scrollTo(0, document.body.scrollHeight);
                    //
                  }
              }
                >View on Map</Button>
              )
            }
          ]
        }
        else if(columnName=="company"){
          return [...prev,{
            title: columnName.toUpperCase(),
            key: columnName,
            dataIndex: columnName,
            render: (text, record)=>(
              // here this simply displays the company name, further data could be added like as in address section
              <span>{record.company.name}</span>
            )
          }]
        }
        return [...prev,{
          title: columnName.toUpperCase(),
          key: columnName,
          dataIndex: columnName
        }]
      })
    }
    else{
      setSelectedColumns((prev)=>{
        if(columnName=="address"){
          setGeoData(null)
          return prev.filter(i=>(i.key!="map" && i.key!="address"))
        }
        return prev.filter(i=>i.key!=columnName)
      })
    }
  }

  useEffect(()=>{
    // for searching functionality
    if(searchText==''){
      setFilteredData([...data])
    }else{
      const result=[]
      const targetColumns=selectedColumns.map(i=>i.key)
      for(let i=0;i<data.length;i++){
        const obj=data[i]
        for(let j=0;j<targetColumns.length;j++){
          const key=targetColumns[j]
          if(key=="action")continue
          // here action column that was implemented for rendering map was causing issue in searching
          const value=(typeof obj[key] === "number")?obj[key]+"":JSON.stringify(obj[key])
          if(value!=undefined && value.toLowerCase().includes(searchText.toLowerCase())){
            result.push(obj)
            break
          }
          
        }
      }
      setFilteredData([...result])
    }
  },[searchText])

  useEffect(()=>{
    const fetchData=async ()=>{
      const url = 'https://jsonplaceholder.typicode.com/users'
      const res=await fetch(url)
      const data = await res.json()

      setData([...data])
      setFilteredData([...data])
      setColumns(Object.keys(data[0]))
    }

    fetchData()
  },[])

  return (
    <div>
      {/* Implement Checkboxes */}
      <div

        className={style.checkBoxContainer}
      >
        {
          columns.length>0 &&
          columns.map((i)=>(
            <Checkbox
              key={i}
              onClick={(e)=>{
                updateSelectedColumns(
                  i,
                  e.target.checked?"add":"delete"
                )
              }}
            >{i}</Checkbox>
          ))
        }
      </div>
      {/* Implement submit button - only after clicking this button and selecting the above checkboxes, the data must be populated to the table */}
      
      <Button
        onClick={()=>{
          setShowTable(data)
          setRenderedColumns([...selectedColumns])
        }}
        type='primary'
        className={style.submitBtn}
      >Submit</Button>

      {
        (showTable) &&
        <div>
          {/* Implement Search */}
          <Input
            value={searchText}
            onChange={(e)=>setSearchText(e.target.value)}
            className={style.searchBar}
          />  

          <Table dataSource={filteredData} columns={renderedColumns}
          // here using renderedColumns instead of selected columns will allow us to not render change until the submit button is clicked
            rowKey={"id"}
            pagination={false}
          />
          <div
           style={{width:"80vw",height:"50vh"}}
          >
            {
              geoData &&
              <MapRender
                lat={geoData.lat}
                lng={geoData.lng}
              />
            }
          </div>
        
        </div>
      }
      
    </div>
  );
};

export default TableRenderer;
