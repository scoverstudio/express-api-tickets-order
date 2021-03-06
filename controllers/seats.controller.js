const Seat = require("../models/seat.model");
const Concert = require("../models/concert.model");
const {
  getAvailableSeatsForDay,
} = require("../helpers/getAvailableSeatsForDay");

exports.getAll = async (req, res) => {
  try {
    const allSeats = await Seat.find();
    res.json(allSeats);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.getById = async (req, res) => {
  try {
    const seatDocument = await Seat.findById(req.params.id);
    if (!seatDocument) res.status(404).json({ message: "Not found" });
    else res.json(seatDocument);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.addSeat = async (req, res) => {
  try {
    const { day, seat, client, email } = req.body;
    const allSeats = await Seat.find();
    if (allSeats.some((el) => el.seat === seat && el.day === day)) {
      res.json({ message: "The slot is already taken..." });
    } else if (day && seat && client && email) {
      const newSeat = new Seat({ day, seat, client, email });
      await newSeat.save();
      const allSeatsUpdated = await Seat.find();
      const ticketsLeft = getAvailableSeatsForDay(day, allSeatsUpdated);
      req.io.emit("seatsUpdated", allSeatsUpdated);
      req.io.emit("ticketsUpdated", ticketsLeft, day);
      res.json({ message: "OK" });
    } else res.status(404).json({ message: "Not found..." });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.modifySeatByID = async (req, res) => {
  try {
    const { day, seat, client, email } = req.body;
    const seatDocument = await Seat.findById(req.params.id);

    if (seatDocument) {
      seatDocument.day = day;
      seatDocument.seat = seat;
      seatDocument.client = client;
      seatDocument.email = email;
      await seatDocument.save();
      res.json({ message: "OK", modifiedDocument: seatDocument });
    } else res.status(404).json({ message: "Not found..." });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.deleteSeatByID = async (req, res) => {
  try {
    const seatDocument = await Seat.findById(req.params.id);
    if (seatDocument) {
      await Seat.deleteOne({ _id: req.params.id });
      res.json({ message: "OK", removedDocument: seatDocument });
    } else res.status(404).json({ message: "Not found..." });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
