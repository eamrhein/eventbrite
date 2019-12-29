import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Form, Container, Row, Col, Button } from "react-bootstrap";
import * as apiutil from "./apiutil";
import * as timeUtil from "./timeUtil";
import * as validationUtil from "./valdiationUtil";
// let formData = {
//   name: {
//     html: ""
//   },
//   start: {
//     timezone: "America/Los_Angeles",
//     utc: dateStart.toJSON()
//   },
//   end: {
//     timezone: "America/Los_Angeles",
//     utc: dateStart.toJSON()
//   },
//   currency: "USD"
// };
function App() {
  // State Setters and getters
  const [dateStart, setDateStart] = useState(timeUtil.roundDate(new Date(), 0));
  const [dateEnd, setDateEnd] = useState(timeUtil.roundDate(new Date(), 1));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imgurl, setImgurl] = useState(null);
  const [organizer, setOrganizer] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [ticketName, setTicketName] = useState("");
  const [numberOfTickets, setNumberOfTickets] = useState(100);
  const [price, setPrice] = useState(0);

  const [validationSchema, setValidationSchema] = useState({
    title: {
      valid: null,
      invalid: null
    },
    date: {
      valid: null,
      invalid: null
    },
    image: {
      valid: null,
      invalid: null
    },
    organizer: {
      valid: null,
      invalid: null
    },
    ticketName: {
      valid: null,
      invalid: null
    }
  });
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
          invalid: bool
        }
      });
    }
  };

  // Change Handlers
  const handleFrom = e => {
    let newDate =
      e.target.name === "time"
        ? timeUtil.appendTime(dateStart, e.target.value)
        : timeUtil.appendDate(dateStart, e.target.value);
    validationUtil.isValidTime(newDate, dateEnd)
      ? setValidity(true, "date")
      : setValidity(false, "date");
    setDateStart(newDate);
  };

  const handleUntil = e => {
    let newDate =
      e.target.name === "time"
        ? timeUtil.appendTime(dateEnd, e.target.value)
        : timeUtil.appendDate(dateEnd, e.target.value);
    validationUtil.isValidTime(dateStart, newDate)
      ? setValidity(true, "date")
      : setValidity(false, "date");
    setDateEnd(newDate);
  };

  const handleInputs = e => {
    switch (e.target.name) {
      case "title":
        validationUtil.checkCharLimit(e.target.value, 70)
          ? setValidity(true, "title")
          : setValidity(false, "title");
        setTitle(e.target.value);
        break;
      case "organizer":
        validationUtil.checkCharLimit(e.target.value, 70)
          ? setValidity(true, "organizer")
          : setValidity(false, "organizer");
        setOrganizer(e.target.value);
        break;
      case "ticketName":
        validationUtil.checkCharLimit(e.target.value, 70)
          ? setValidity(true, "ticketName")
          : setValidity(false, "ticketName");
        setTicketName(e.target.value);
        break;
      case "description":
        setDescription(e.target.value);
        break;
      case "numberOfTickets":
        setNumberOfTickets(e.target.value);
        break;
      case "orgDesc":
        setOrgDesc(e.target.value);
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
    const form = e.currentTarget;
    console.log(form);
    if (form.checkValidity() === false) {
      e.stopPropagation();
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
            setImgurl(res.url);
          });
      });
    }
  };
  console.log(ticketName);
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
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
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
                  <Col>
                    <Form.Label>What day of the week?</Form.Label>
                    <Form.Control as="select">
                      {timeUtil.dayOfWeek()}
                    </Form.Control>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group>
                <Row>
                  <Col>
                    <Form.Label>From</Form.Label>
                    <Form.Control
                      required
                      name="time"
                      value={timeUtil.parse12htime(dateStart)}
                      isInvalid={validationSchema.date.invalid}
                      isValid={validationSchema.date.valid}
                      as="select"
                      onChange={handleFrom}
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
                      name="time"
                      value={timeUtil.parse12htime(dateEnd)}
                      isInvalid={true}
                      as="select"
                      onChange={handleUntil}
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
              </Form.Group>
              <Form.Group>
                <Row>
                  <Col>
                    <Form.Label>Occurs From</Form.Label>
                    <Form.Control
                      name="date"
                      isInvalid={true}
                      type="date"
                      min={timeUtil.parseDate(
                        timeUtil.roundDate(new Date(), 0)
                      )}
                      onChange={handleFrom}
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
                      isInvalid={true}
                      name="date"
                      type="date"
                      onChange={handleUntil}
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
                          <img alt="banner" src={imgurl} />
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
                <Form.Label>Organizer Name</Form.Label>
                <Form.Control
                  type="text"
                  name="organizer"
                  value={organizer}
                  onChange={handleInputs}
                  isValid={validationSchema.organizer.valid}
                  isInvalid={validationSchema.organizer.invalid}
                  placeholder="Who is Organising this event?"
                />
                <Form.Control.Feedback type="invalid">
                  Must be under 70 characters
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>Organizer Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="orgDesc"
                  value={orgDesc}
                  onChange={handleInputs}
                />
              </Form.Group>
              <Form.Group>
                <Row>
                  <Col>
                    <Form.Label>Ticket Name</Form.Label>
                    <Form.Control
                      required
                      isInvalid={true}
                      type="text"
                      value={ticketName}
                      name="ticketName"
                      onChange={handleInputs}
                      placeholder="Ticket Name"
                    />
                    <Form.Control.Feedback type="invalid">
                      Ticket name is required.
                    </Form.Control.Feedback>
                  </Col>
                  <Col>
                    <Form.Label>Quantity Available</Form.Label>
                    <Form.Control
                      value={numberOfTickets}
                      name="numberOfTickets"
                      onChange={handleInputs}
                      isInvalid={true}
                      type="number"
                      placeholder="100"
                    />
                    <Form.Control.Feedback type="invalid">
                      Must be greater than zero.
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
    </main>
  );
}

export default App;
