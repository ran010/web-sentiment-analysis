import React, {useState, useEffect} from 'react';
import { Container, Row, Col, Input, FormGroup, Form, Button,Navbar} from 'reactstrap';
import axios from "axios";
import Loader from 'react-loader-spinner';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import Sentiment from './images/sentiments.png'
import TextScroller from './components/TextScroller'
import TagCloud from 'react-tag-cloud';
import randomColor from 'randomcolor';

function App() {
  const [statDetails, setStatDetails] = useState({total: '', death:'', recovered: ''})
  const [trendingData, setTrendingData] = useState([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [sentimentResponse, setSentimentResponse] = useState([])
  const [loader, setLoader] = useState(false)
  const [positiveWordCloud, setPositiveWordCloud] = useState([])
  const [negativeWordCloud, setNegativeWordCloud] = useState([])
  const [neutralWordCloud, setNEutralWordCloud] = useState([])


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
        var data = JSON.parse(response.data)
        var mostRetweet = data.sort((a, b) => (a.retweet_count > b.retweet_count) ? -1 : 1)
        var positive = data.filter(key => key.pos > 0.1 )
        var negative = data.filter(key => key.neg > 0.1 )
        var neutral = data.filter(key => key.net > 0.1 )
        var postiveWord= []
        var negativeWord= []
        var neutralWord = []

        positive.map((item, key) =>
          postiveWord = item.filtered_words + postiveWord
        );
        negative.map((item, key) =>
          negativeWord = item.filtered_words + negativeWord
        );
        neutral.map((item, key) =>
          neutralWord = item.filtered_words + neutralWord
        );
        setPositiveWordCloud(countWord(postiveWord))
        setNegativeWordCloud(countWord(negativeWord))
        setNEutralWordCloud(countWord(neutralWord))


        setSentimentResponse(mostRetweet.slice(0, 3))
        setLoader(false)
      })
    }
  }
  const countWord = (arr)=> {
    if (arr != []){
      var wordCloud = (arr.length != 0) ? arr.split(",") : []
      var counts = {}
      wordCloud.forEach(function(x) {
        counts[x] = (counts[x] || 0)+1;
      });
      var objKeys =  Object.keys(counts)
      var objValues =  Object.values(counts)
      var newWordCLoud = []
      objKeys.map((item, key) => {
        if (key > 20) {
          newWordCLoud.push(objKeys[key])
        }
      })
      return newWordCLoud
    }else{
      return []
    }

  }
  return (
    <Container>
      <TextScroller text="Stay Safe" />
      <Row>
        <Col md={3} sm={12}>
          <h3>Trending Topics</h3>
          {(trendingData || []).map((data) => {
            return(
              <>
                <p><a  key={data.name} href={data.url || ''}>{data.name}</a></p>
              </>
            )
          })}
        </Col>
        <Col md={6} sm={12} className="mb-sm-5">
          <p className="text-center font-weight-bold">Search a keyword to get Word Cloud of sentiments</p>
          <Form >
            <FormGroup>
              <Input name="searchKeyword" className="search" placeholder="Enter keyword to search" onChange={handleInput}/>
            </FormGroup>
            <Button onClick={getSentimentData} className='ml-1'>Submit</Button>
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
          {!loader && sentimentResponse.length == 0 && (
            <div className="text-center">
              <h3>Search a tag to classify tweets sentiment</h3>
              <img src={Sentiment} className="w-75" />
            </div>
          )}
          {console.log(positiveWordCloud.length)}
          {!loader && positiveWordCloud.length > 0 && (
            <>
              <h4>Positive Word Cloud</h4>
              <TagCloud
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  color: () => randomColor(),
                  padding: 5,
                  width: '100%',
                  height: '400px'
                }}>
                {positiveWordCloud.map((x) => {
                  return (<div>{x}</div>)
                })}

              </TagCloud>
            </>

          )
         }
          {!loader && neutralWordCloud.length > 0 && (
            <>
              <h4>Neutral Word Cloud</h4>
              <TagCloud
                style={ {
                  fontFamily: 'sans-serif',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  color: () => randomColor(),
                  padding: 5,
                  width: '100%',
                  height: '400px'
                } }>
                { neutralWordCloud.map((x) => {
                  return (<div>{ x }</div>)
                }) }

              </TagCloud>
              <hr/>
            </>

          )
          }
          {!loader && negativeWordCloud.length > 0 && (
            <>
              <h4>Negative Word Cloud</h4>
              <TagCloud
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  color: () => randomColor(),
                  padding: 5,
                  width: '100%',
                  height: '400px'
                }}>
                {negativeWordCloud.map((x) => {
                  return (<div>{x}</div>)
                })}
              </TagCloud>
              <hr/>
            </>

          )
          }

          {!loader && sentimentResponse.length > 1 && (
            <>
              <hr/>
              <h3>Top retweet for {searchKeyword}</h3>
            </>
          )}
          {!loader && sentimentResponse && (sentimentResponse || []).map((response) => {
            return(
              <>
               <p>{response.tweet}</p>
              </>
              )
          } )}
        </Col>
        <Col md={3} sm={12}>
          <div>
            <h3>Covid Cases</h3>
            <p>Total Cases: {statDetails.total}</p>
            <p>Total Death: {statDetails.death}</p>
            <p>Total Recovered: {statDetails.recovered}</p>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default App;
