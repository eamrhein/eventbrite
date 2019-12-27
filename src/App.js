import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Form, Container, Row, Col, Button } from "react-bootstrap";
import * as apiutil from "./apiutil";
import * as timeUtil from "./timeUtil";

function App() {
  // State Setters and getters
  const [event, setEvent] = useState({
    name: {
      html: ""
    },
    start: {
      timezone: "America/Los_Angeles",
      utc: new Date().toISOString()
    },
    end: {
      timezone: "America/Los_Angeles",
      utc: new Date().toISOString()
    },
    currency: "USD"
  });
  const [imgurl, setImgurl] = useState(null);
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
    }
  });

  // Change Handlers
  const handleFrom = e => {
    if (e.currentTarget.value) {
      setEvent({
        ...event,
        start: {
          timezone: event.start.timezone,
          utc: new Date(e.currentTarget.value).toISOString()
        }
      });
    }
  };
  const handleUntil = e => {
    if (e.currentTarget.value) {
      setEvent({
        ...event,
        end: {
          timezone: event.end.timezone,
          utc: new Date(e.currentTarget.value).toISOString()
        }
      });
    }
  };

  const handleTitle = e => {
    if (e.currentTarget.value.length < 70 && e.currentTarget.value.length > 0) {
      setValidationSchema({
        ...validationSchema,
        title: {
          valid: true
        }
      });
    } else if (e.currentTarget.value.length === 0) {
      setValidationSchema({
        ...validationSchema,
        title: {
          invalid: true
        }
      });
    }
    setEvent({
      ...event,
      name: {
        html: e.currentTarget.value
      }
    });
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
                  type="text"
                  maxLength="70"
                  placeholder="Give it a short distinct name"
                  value={event.name.html}
                  onChange={handleTitle}
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
                    <Form.Control required isInvalid={true} as="select">
                      {timeUtil.timeOfDay()}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      Must be before end time.
                    </Form.Control.Feedback>
                  </Col>
                  <Col>
                    <Form.Label>To</Form.Label>
                    <Form.Control isInvalid={true} as="select">
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
                      isInvalid={true}
                      type="date"
                      onChange={handleFrom}
                      value={event.start.utc.slice(0, 10)}
                    />
                    <Form.Control.Feedback type="invalid">
                      Must be before end date.
                    </Form.Control.Feedback>
                  </Col>
                  <Col>
                    <Form.Label>Occurs Until</Form.Label>
                    <Form.Control
                      isInvalid={true}
                      type="date"
                      onChange={handleUntil}
                      value={event.end.utc.slice(0, 10)}
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
                <Form.Control as="textarea" rows="4" />
              </Form.Group>
              <Form.Group>
                <Form.Label>Organizer Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Who is Organising this event?"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Organizer Description</Form.Label>
                <Form.Control as="textarea" />
              </Form.Group>
              <Form.Group>
                <Row>
                  <Col>
                    <Form.Label>Ticket Name</Form.Label>
                    <Form.Control
                      required
                      isInvalid={true}
                      type="text"
                      placeholder="Ticket Name"
                    />
                    <Form.Control.Feedback type="invalid">
                      Ticket name is required.
                    </Form.Control.Feedback>
                  </Col>
                  <Col>
                    <Form.Label>Quantity Available</Form.Label>
                    <Form.Control
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
