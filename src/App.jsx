import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {
  Form,
  Container,
  Row,
  Col,
  Button,
  Alert,
  Image,
  Card,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import * as apiutil from './api/apiutil';
import * as timeUtil from './timeUtil';
import * as validationUtil from './valdiationUtil';
import 'react-datepicker/dist/react-datepicker.css';

function App() {
  // State Setters and getters
  const [dateStart, setDateStart] = useState(timeUtil.roundDate(new Date(), 0));
  const [dateStartEndTime, setStartDateEndTime] = useState(
    timeUtil.roundDate(new Date(), 1),
  );
  const [dateEnd, setDateEnd] = useState(timeUtil.roundDate(new Date(), 1));
  const [err, setErr] = useState([]);
  const [occurences, setOccurences] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imgurl, setImgurl] = useState(null);
  const [imgid, setImgid] = useState(null);
  const [ticketName, setTicketName] = useState('');
  const [numberOfTickets, setNumberOfTickets] = useState(100);
  const [price, setPrice] = useState('0.00');
  const [validationSchema, setValidationSchema] = useState(
    validationUtil.validationSchema,
  );

  const [eventurl, setEventurl] = useState([]);
  // Function to set an input to valid or invalid
  const setValidity = (bool, key) => {
    if (bool) {
      setValidationSchema({
        ...validationSchema,
        [key]: {
          valid: bool,
        },
      });
    } else {
      setValidationSchema({
        ...validationSchema,
        [key]: {
          invalid: !bool,
        },
      });
    }
  };

  const createDays = (start, end) => {
    const dates = [];
    let curr = start;
    const addDays = (days) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    };
    while (curr <= end) {
      dates.push(curr);
      curr = addDays.call(curr, 7);
    }
    return dates.length;
  };

  // input handler validates and sets inputs on change
  // switch statement based on the name of the element
  const handleInputs = (e) => {
    let time;
    let endtime;
    switch (e.target.name) {
      case 'title':
        if (validationUtil.checkCharLimit(e.target.value, 70)
        && e.target.value.length > 0) {
          setValidity(true, 'title');
        } else {
          setValidity(false, 'title');
        }
        setTitle(e.target.value);
        break;
      case 'ticketName':
        if (validationUtil.checkCharLimit(e.target.value, 70)
        && e.target.value.length > 0) {
          setValidity(true, 'ticketName');
        } else {
          setValidity(false, 'ticketName');
        }
        setTicketName(e.target.value);
        break;
      case 'from':
        time = timeUtil.appendTime(dateStart, e.target.value);
        if (validationUtil.isValidTime(time, dateEnd)) {
          setValidity(true, 'date');
        } else {
          setValidity(false, 'date');
        }
        setDateStart(time);
        setDuration(timeUtil.calcDuration(time, dateStartEndTime));
        break;
      case 'to':
        time = timeUtil.appendTime(dateEnd, e.target.value);
        endtime = timeUtil.appendTime(dateStartEndTime, e.target.value);
        if (validationUtil.isValidTime(dateStart, time)) {
          setValidity(true, 'date');
        } else {
          setValidity(false, 'date');
        }
        setDateEnd(time);
        setStartDateEndTime(endtime);
        setDuration(timeUtil.calcDuration(dateStart, endtime));
        break;
      case 'description':
        setDescription(e.target.value);
        break;
      case 'numberOfTickets':
        setNumberOfTickets(e.target.value);
        break;
      case 'price':
        setPrice(e.target.value);
        break;
      default:
        break;
    }
  };

  const handleFrom = (date) => {
    if (validationUtil.isValidTime(date, dateEnd)) {
      setValidity(true, 'date');
    } else {
      setValidity(false, 'date');
    }
    setDateStart(date);
    const days = createDays(date, dateEnd);
    setOccurences(days);
  };

  const handleUntil = (date) => {
    if (validationUtil.isValidTime(dateStart, date)) {
      setValidity(true, 'date');
    } else {
      setValidity(false, 'date');
    }
    setDateEnd(date);
    const days = createDays(dateStart, date);
    setOccurences(days);
  };


  // Sumbit Handling
  // Check if form is valid
  // if not valid show error messages
  // if valid
  //  Create Event,
  //  Create Tickets,
  //
  const handleSubmit = (e) => {
    setErr([]);
    e.preventDefault();
    const validKeys = (key) => {
      const value = validationSchema[key].valid;
      return value === true || value === null;
    };
    const keys = Object.keys(validationSchema);
    if (keys.every(validKeys)) {
      e.stopPropagation();
      const eventPackage = validationUtil.parseEvent(
        title,
        description,
        dateStartEndTime,
        dateEnd,
        imgid,
        occurences > 1,
      );
      apiutil
        .createEvent(eventPackage)
        .then((res) => {
          setEventurl(eventurl.concat([res.url]));
          return res;
        })
        .then((parent) => {
          if (occurences > 1) {
            const rule = `DTSTART:${dateStart.toJSON()}\nRRULE:FREQ=WEEKLY;COUNT=${occurences}
              `;
            apiutil.createSeries(parent.id, duration, rule)
              .catch((error) => setErr(err.concat([error.message])));
          }
          return parent;
        })
        .then((parent) => {
          apiutil.createTicket(parent.id, price, numberOfTickets, ticketName)
            .catch((error) => setErr(err.concat([error.message])));
          return parent;
        })
        .then((parent) => {
          apiutil.publishEvent(parent.id)
            .catch((error) => setErr(err.concat([error.message])));
        })
        .catch((error) => {
          setErr(err.concat([error.message]));
        });
      setDateStart(timeUtil.roundDate(new Date(), 0));
      setStartDateEndTime(timeUtil.roundDate(new Date(), 1));
      setDateEnd(timeUtil.roundDate(new Date(), 1));
      setOccurences(0);
      setDuration(0);
      setTitle('');
      setDescription('');
      setImgurl(null);
      setImgid(null);
      setTicketName('');
      setNumberOfTickets(100);
      setPrice('0.00');
    } else {
      setErr(err.concat(['Formdata is invalid']));
    }
  };

  // image upload
  // 1 use local image until upload is successfull
  // 2 get upload token from eventbrite api
  // 3 upload image to aws using evenbrite data
  // 5 get image url from evenbrite api
  // 5 set new image url as new image
  const uploadBanner = (e) => {
    if (e.currentTarget.files[0]) {
      const img = e.currentTarget.files[0];
      setImgurl(URL.createObjectURL(img));
      apiutil.getUploadSignature().then((res) => {
        apiutil
          .uploadImage(img, res.upload_url, res.upload_data)
          .then(() => apiutil.getUploadedUrl(res.upload_token))
          .then((res2) => {
            setImgid(res2.id);
            setImgurl(res2.url);
          });
      });
    }
  };

  return (
    <main>
      <Container fluid>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <h1 className="title">Eventbrite</h1>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <h4 className="title">Event Creation Tool</h4>
          </Col>
        </Row>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Card className="mt-3">
                <Card.Header as="h5">Title</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      required
                      isInvalid={validationSchema.title.invalid}
                      isValid={validationSchema.title.valid}
                      name="title"
                      type="text"
                      maxLength="70"
                      placeholder="Give it a short distinct name"
                      value={title}
                      onChange={handleInputs}
                    />
                    <Form.Control.Feedback type="valid">
                      Looks Good
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      A Title is required
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="mt-3">
                <Card.Header as="h5">Location</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Group controlId="VenueName">
                      <Form.Control placeholder="Venue Name" />
                    </Form.Group>
                    <Form.Group controlId="formGridAddress1">
                      <Form.Label>Address</Form.Label>
                      <Form.Control placeholder="1234 Main St" />
                    </Form.Group>

                    <Form.Group controlId="formGridAddress2">
                      <Form.Label>Address 2</Form.Label>
                      <Form.Control placeholder="Apartment, studio, or floor" />
                    </Form.Group>

                    <Form.Row>
                      <Form.Group as={Col} controlId="formGridCity">
                        <Form.Label>City</Form.Label>
                        <Form.Control />
                      </Form.Group>

                      <Form.Group as={Col} controlId="formGridState">
                        <Form.Label>State</Form.Label>
                        <Form.Control as="select">
                          <option>CA</option>
                          <option>NY</option>
                        </Form.Control>
                      </Form.Group>

                      <Form.Group as={Col} controlId="formGridZip">
                        <Form.Label>Zip</Form.Label>
                        <Form.Control />
                      </Form.Group>
                    </Form.Row>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="mt-3">
                <Card.Header as="h5">Schedule Dates</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Row>
                      <Col>
                        <Form.Label>How Often?</Form.Label>
                        <Form.Control disabled defaultValue="Weekly" />
                      </Col>
                    </Row>
                  </Form.Group>
                  <Form.Group>
                    <Row>
                      <Col>
                        <Form.Label>From</Form.Label>
                        <Form.Control
                          required
                          name="from"
                          onChange={handleInputs}
                          value={timeUtil.parse12htime(dateStart)}
                          isInvalid={validationSchema.date.invalid}
                          isValid={validationSchema.date.valid}
                          as="select"
                        >
                          {timeUtil.timeOfDay()}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          Must be before end time.
                        </Form.Control.Feedback>
                      </Col>
                      <Col>
                        <Form.Label>To</Form.Label>
                        <Form.Control
                          required
                          name="to"
                          onChange={handleInputs}
                          value={timeUtil.parse12htime(dateEnd)}
                          as="select"
                          isInvalid={validationSchema.date.invalid}
                          isValid={validationSchema.date.valid}
                        >
                          {timeUtil.timeOfDay(30)}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          Must be Afer start time.
                        </Form.Control.Feedback>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        {duration > 0 ? (
                          <Alert className="eventlist" variant="success">
                            Duration of
                            {' '}
                            {duration / 60}
                            {' '}
    Minutes
                          </Alert>
                        ) : (
                          ''
                        )}
                      </Col>
                    </Row>
                  </Form.Group>
                  <Form.Group>
                    <Row>
                      <Col>
                        <p>Occurs From:</p>
                        <DatePicker
                          className="form-control"
                          minDate={dateStart}
                          onChange={handleFrom}
                          selected={dateStart}
                          isInvalid={validationSchema.date.invalid}
                          isValid={validationSchema.date.valid}
                        />
                      </Col>
                      <Col>
                        <p>Occurs Until</p>
                        <DatePicker
                          className="form-control"
                          onChange={handleUntil}
                          minDate={dateEnd}
                          selected={dateEnd}
                          isInvalid={validationSchema.date.invalid}
                          isValid={validationSchema.date.valid}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        {occurences > 0 ? (
                          <Alert className="eventlist" variant="success">
                            {occurences}
                            {' '}
    Events
                          </Alert>
                        ) : (
                          ''
                        )}
                      </Col>
                    </Row>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="mt-3">
                <Card.Header as="h5">Event Image</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Event Image</Form.Label>
                    <Row>
                      <Col className="image-upload">
                        <div className="img-upload-inner">
                          <Form.Control
                            className="inputfile"
                            id="file"
                            type="file"
                            onChange={uploadBanner}
                            accept="image/png, image/jpeg"
                            isInvalid={false}
                          />
                          <Form.Label htmlFor="file">
                            {imgurl ? (
                              <Image alt="banner" src={imgurl} fluid />
                            ) : (
                              <div className="default-img">
                                {' '}
                                <i className="fa fa-camera" />
                                <h6>Add Event Image</h6>
                                <p>
                                  Choose a compelling image that brings your event
                                  to life
                                </p>
                              </div>
                            )}
                          </Form.Label>
                          <Form.Control.Feedback type="invalid">
                          Must be less than 10MB.
                          </Form.Control.Feedback>
                        </div>
                      </Col>
                    </Row>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="mt-3">
                <Card.Header as="h5">Description</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Event Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="4"
                      name="description"
                      onChange={handleInputs}
                      value={description}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="mt-3">
                <Card.Header as="h5">Tickets</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Row>
                      <Col>
                        <Form.Label>Ticket Name</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          value={ticketName}
                          name="ticketName"
                          onChange={handleInputs}
                          placeholder="Ticket Name"
                          isValid={validationSchema.ticketName.valid}
                          isInvalid={validationSchema.ticketName.invalid}
                        />
                        <Form.Control.Feedback type="invalid">
                          Ticket name is required.
                        </Form.Control.Feedback>
                      </Col>
                      <Col>
                        <Form.Label>Quantity Available</Form.Label>
                        <Form.Control
                          value={numberOfTickets}
                          min="1"
                          max="30000"
                          name="numberOfTickets"
                          onChange={handleInputs}
                          type="number"
                          placeholder="100"
                        />
                        <Form.Control.Feedback type="invalid">
                          Must have one or more tickets.
                        </Form.Control.Feedback>
                      </Col>
                      <Col>
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                          type="number"
                          min="0.00"
                          max="10000.00"
                          step="0.01"
                          placeholder="Free"
                          name="price"
                          value={price}
                          onChange={handleInputs}
                        />
                        <Form.Control.Feedback type="invalid">
                          Must be a postitive number that is less than 10000
                        </Form.Control.Feedback>
                      </Col>
                    </Row>
                  </Form.Group>
                  <Row>
                    <Col>
                      {eventurl.length > 0 ? (
                        <Alert className="eventlist" variant="success">
                          <h6>Event URL</h6>
                          {eventurl.map((url) => (
                            <Row key={url}>
                              <Col>
                                <a rel="noopener noreferrer" target="_blank" href={url}>{url}</a>
                              </Col>
                            </Row>
                          ))}
                        </Alert>
                      ) : (
                        ''
                      )}
                      {err.length > 0 ? (
                        <Alert className="eventlist" variant="danger">
                          <h6>Error</h6>
                          {err}
                        </Alert>
                      ) : (
                        ''
                      )}
                    </Col>
                  </Row>
                  <Button variant="success" type="submit" size="lg">
                  Create Event
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </main>
  );
}

export default App;
