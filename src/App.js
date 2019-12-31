import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  Form,
  Container,
  Row,
  Col,
  Button,
  Alert,
  Image
} from "react-bootstrap";
import * as apiutil from "./apiutil";
import * as timeUtil from "./timeUtil";
import * as validationUtil from "./valdiationUtil";

function App() {
  // State Setters and getters
  const [dateStart, setDateStart] = useState(timeUtil.roundDate(new Date(), 0));
  const [dateStartEndTime, setStartDateEndTime] = useState(
    timeUtil.roundDate(new Date(), 1)
  );
  const [dateEnd, setDateEnd] = useState(timeUtil.roundDate(new Date(), 1));
  const [occurences, setOccurences] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imgurl, setImgurl] = useState(null);
  const [imgid, setImgid] = useState(null);
  const [ticketName, setTicketName] = useState("");
  const [numberOfTickets, setNumberOfTickets] = useState(100);
  const [price, setPrice] = useState(0);
  const [validationSchema, setValidationSchema] = useState(
    validationUtil.validationSchema
  );
  const [eventurl, setEventurl] = useState(null);
  //Function to set an input to valid or invalid
  const setValidity = (bool, key) => {
    if (bool) {
      setValidationSchema({
        ...validationSchema,
        [key]: {
          valid: bool
        }
      });
    } else {
      setValidationSchema({
        ...validationSchema,
        [key]: {
          invalid: !bool
        }
      });
    }
  };

  const createDays = (start, end) => {
    let dates = [];
    let curr = start;
    let addDays = function(days) {
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };
    while (curr <= end) {
      dates.push(curr);
      curr = addDays.call(curr, 7);
    }
    return dates.length;
  };

  //input handler validates and sets inputs on change
  // switch statement based on the name of the element
  const handleInputs = e => {
    let time;
    let days;
    let endtime;
    switch (e.target.name) {
      case "title":
        validationUtil.checkCharLimit(e.target.value, 70) &&
        e.target.value.length > 0
          ? setValidity(true, "title")
          : setValidity(false, "title");
        setTitle(e.target.value);
        break;
      case "ticketName":
        validationUtil.checkCharLimit(e.target.value, 70) &&
        e.target.value.length > 0
          ? setValidity(true, "ticketName")
          : setValidity(false, "ticketName");
        setTicketName(e.target.value);
        break;
      case "from":
        time = timeUtil.appendTime(dateStart, e.target.value);
        validationUtil.isValidTime(time, dateEnd)
          ? setValidity(true, "date")
          : setValidity(false, "date");
        setDateStart(time);
        setDuration(timeUtil.calcDuration(time, dateStartEndTime));
        break;
      case "to":
        time = timeUtil.appendTime(dateEnd, e.target.value);
        endtime = timeUtil.appendTime(dateStartEndTime, e.target.value);
        validationUtil.isValidTime(dateStart, time)
          ? setValidity(true, "date")
          : setValidity(false, "date");
        setDateEnd(time);
        setStartDateEndTime(endtime);
        setDuration(timeUtil.calcDuration(dateStart, endtime));
        break;
      case "occursFrom":
        time = timeUtil.createDate(dateStart, e.target.value);
        validationUtil.isValidTime(time, dateEnd)
          ? setValidity(true, "date")
          : setValidity(false, "date");
        setDateStart(time);
        days = createDays(time, dateEnd);
        setOccurences(days);
        break;
      case "occursUntil":
        time = timeUtil.createDate(dateEnd, e.target.value);
        validationUtil.isValidTime(dateStart, time)
          ? setValidity(true, "date")
          : setValidity(false, "date");
        setDateEnd(time);
        days = createDays(dateStart, time);
        setOccurences(days);
        break;
      case "description":
        setDescription(e.target.value);
        break;
      case "numberOfTickets":
        setNumberOfTickets(e.target.value);
        break;
      case "price":
        setPrice(e.target.value);
        break;
      default:
        break;
    }
  };

  //Sumbit Handling
  // Check if form is valid
  // if not valid show error messages
  // if valid
  //  Create Event,
  //  Create Tickets,
  //
  const handleSubmit = e => {
    e.preventDefault();
    const validKeys = key => {
      let value = validationSchema[key].valid;
      return value === true || value === null;
    };
    const keys = Object.keys(validationSchema);
    if (keys.every(validKeys)) {
      e.stopPropagation();
      let eventPackage = validationUtil.parseEvent(
        title,
        description,
        dateStartEndTime,
        dateEnd,
        imgid,
        occurences > 1
      );
      try {
        apiutil
          .createEvent(eventPackage)
          .then(res => {
            setEventurl(res.url);
            console.log(res);
            return res;
          })
          .then(parent => {
            if (occurences > 1) {
              let rule = `DTSTART:${dateStart.toJSON()}\nRRULE:FREQ=WEEKLY;COUNT=${occurences}
              `;
              apiutil.createSeries(parent.id, duration, rule);
            }
            return parent;
          })
          .then(parent => {
            apiutil.createTicket(parent.id, price, numberOfTickets, ticketName);
            return parent;
          })
          .then(parent => {
            apiutil.publishEvent(parent.id);
          });
      } catch (err) {
        console.log(err.message);
      }
    } else {
      console.log("invalid");
    }
  };

  // image upload
  // 1 use local image until upload is successfull
  // 2 get upload token from eventbrite api
  // 3 upload image to aws using evenbrite data
  // 5 get image url from evenbrite api
  // 5 set new image url as new image
  const uploadBanner = e => {
    if (e.currentTarget.files[0]) {
      let img = e.currentTarget.files[0];
      setImgurl(URL.createObjectURL(img));
      apiutil.getUploadSignature().then(res => {
        apiutil
          .uploadImage(img, res.upload_url, res.upload_data)
          .then(() => apiutil.getUploadedUrl(res.upload_token))
          .then(res => {
            setImgid(res.id);
            setImgurl(res.url);
          });
      });
    }
  };
  return (
    <main>
      <Container>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <h1>eventbrite</h1>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <h4>Create A Repeating Event</h4>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form onSubmit={handleSubmit}>
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
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control disabled defaultValue="San Francisco" />
              </Form.Group>
              <Form.Group>
                <h5>Schedule Dates</h5>
              </Form.Group>
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
                      {timeUtil.timeOfDay()}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      Must be before end time.
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    {duration > 0 ? (
                      <Alert className="eventlist" variant="success">
                        Duration of {duration / 60} Minutes
                      </Alert>
                    ) : (
                      ""
                    )}
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group>
                <Row>
                  <Col>
                    <Form.Label>Occurs From</Form.Label>
                    <Form.Control
                      name="occursFrom"
                      type="date"
                      min={timeUtil.parseDate(
                        timeUtil.roundDate(new Date(), 0)
                      )}
                      onChange={handleInputs}
                      value={timeUtil.parseDate(dateStart)}
                      isInvalid={validationSchema.date.invalid}
                      isValid={validationSchema.date.valid}
                    />
                    <Form.Control.Feedback type="invalid">
                      Must be before end date.
                    </Form.Control.Feedback>
                  </Col>
                  <Col>
                    <Form.Label>Occurs Until</Form.Label>
                    <Form.Control
                      name="occursUntil"
                      type="date"
                      onChange={handleInputs}
                      min={timeUtil.parseDate(
                        timeUtil.roundDate(new Date(), 1)
                      )}
                      value={timeUtil.parseDate(dateEnd)}
                      isInvalid={validationSchema.date.invalid}
                      isValid={validationSchema.date.valid}
                    />
                    <Form.Control.Feedback type="invalid">
                      Must be after start date.
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    {occurences > 0 ? (
                      <Alert className="eventlist" variant="success">
                        {occurences} Events
                      </Alert>
                    ) : (
                      ""
                    )}
                  </Col>
                </Row>
              </Form.Group>
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
                        isInvalid={true}
                      />
                      <Form.Label htmlFor="file">
                        {imgurl ? (
                          <Image alt="banner" src={imgurl} fluid />
                        ) : (
                          <div>
                            {" "}
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
              <Button variant="success" type="submit" size="lg">
                Create Event
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
      <Row>
        <Col>
          {eventurl ? (
            <Alert className="eventlist" variant="success">
              <h6>List of Events</h6>
              <a href={eventurl}>{eventurl}</a>
            </Alert>
          ) : (
            ""
          )}
        </Col>
      </Row>
    </main>
  );
}

export default App;
