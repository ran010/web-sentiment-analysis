import React, {useState, useEffect} from 'react';
import { Container, Row, Col, Input, FormGroup, Form, Button,Navbar} from 'reactstrap';
import axios from "axios";
import Loader from 'react-loader-spinner';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import TextScroller from './components/TextScroller'
function App() {
  const [statDetails, setStatDetails] = useState({total: '', death:'', recovered: ''})
  const [trendingData, setTrendingData] = useState([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [sentimentResponse, setSentimentResponse] = useState([])
  const [loader, setLoader] = useState(false)
  useEffect( ()=> {
    axios.get('https://corona.lmao.ninja/v2/countries')
    .then(function (response) {
      var data = response.data
      var totalCases = data.reduce((prev,next) => prev + next.cases,0)
      var totalRecovered = data.reduce((prev,next) => prev + next.recovered,0)
      var totalDeath = data.reduce((prev,next) => prev + next.deaths,0)
      setStatDetails({total: totalCases, death:totalDeath, recovered: totalRecovered})
    })

    axios({url: 'https://twiter-sentiment-api.herokuapp.com/trending', method: 'get'})
    .then(function (response) {
      setTrendingData(response.data.slice(0, 10))
    })
  },[])

  const handleInput = (event) => {
    event.persist();
    setSearchKeyword(event.target.value)
  }

  const getSentimentData = () => {
    console.log(searchKeyword)
    if (searchKeyword != ''){
      setLoader(true)
      axios({
        method: 'post',
        "headers": {
          "Content-Type": "application/json"
        },
        url: 'https://twiter-sentiment-api.herokuapp.com/',
        data:{
          keyword: searchKeyword,
        }
      }).then((response)=> {
        setSentimentResponse(response.data)
        setLoader(false)
      })
    }
  }

  return (
    <Container>


      <TextScroller text="Stay Home Stay Safe" />
      <Row>
        <Col md={3}>
          <h3>Trending Topics</h3>
          {(trendingData || []).map((data) => {
            return(
              <>
                <p><a  key={data.name} href={data.url || ''}>{data.name}</a></p>
              </>
            )
          })}
        </Col>
        <Col md={6}>
          <Form >
            <FormGroup>
              <Input name="searchKeyword" className="search" placeholder="Enter keyword to search" onChange={handleInput}/>
            </FormGroup>
            <Button onClick={getSentimentData}>Submit</Button>
          </Form>
          <div className="text-center pt-5">
            <Loader
              type="Circles"
              color="#00BFFF"
              height={200}
              width={200}
              visible={loader}

            />
          </div>

          {!loader && sentimentResponse && (sentimentResponse || []).map((response) => {
            return(
              <>
               <p><a href={`https://twitter.com/user/status/${response.id}`}>{response.tweet}>{response.tweet}</a></p>
              </>
              )
          } )}
        </Col>
        <Col md={3}>
          <div>
            <h3>Covid Cases</h3>
            <p>Total Cases: {statDetails.total}</p>
            <p>Total Death: {statDetails.death}</p>
            <p>Total Recovered: {statDetails.recovered}</p>
          </div>
          <div className="fb-page" data-href="https://www.facebook.com/WHO" data-tabs="timeline" data-width="500"
               data-height="" data-small-header="true" data-adapt-container-width="true" data-hide-cover="false"
               data-show-facepile="false">
            <blockquote cite="https://www.facebook.com/WHO" className="fb-xfbml-parse-ignore"><a
              href="https://www.facebook.com/WHO">World Health Organization (WHO)</a></blockquote>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default App;
