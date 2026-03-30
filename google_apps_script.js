/* 🗳️ HACKATHON VOTING SYSTEM - POWERED BY GOOGLE APPS SCRIPT */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // Wait up to 10 seconds for a lock

  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "sendOtp") return handleSendOtp(data.email);
    if (action === "signup") return handleSignup(data);
    if (action === "login") return handleLogin(data.prn);
    if (action === "vote") return handleVote(data.prn, data.projectId, data.voteType);
    if (action === "adminStats") return handleAdminStats();

    return createResponse({ status: "error", message: "Unknown action: " + action });
  } catch (err) {
    return createResponse({ status: "error", message: "Server Error: " + err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const action = e.parameter.action;
  if (action === "getProjects") return handleGetProjects();
  if (action === "adminStats") return handleAdminStats();
  return createResponse({ status: "error", message: "Ready to Vote!" });
}

// 📧 1. SEND OTP FUNCTION
function handleSendOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpSheet = ss.getSheetByName("OTPs") || ss.insertSheet("OTPs");

  // Clear old OTPs for this email
  const data = otpSheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] === email) otpSheet.deleteRow(i + 1);
  }

  // Save New OTP
  otpSheet.appendRow([email, otp, new Date().getTime()]);

  // Send Email
  MailApp.sendEmail({
    to: email,
    subject: "HACKVOTE: Your OTP Code",
    htmlBody: `<h3>Your Verification Code is: <b>${otp}</b></h3><p>Valid for 5 minutes.</p>`
  });

  return createResponse({ status: "success", message: "OTP Sent to " + email });
}

// 👤 2. SIGNUP (WITH OTP VERIFICATION)
function handleSignup(user) {
  const otpSheet = ss.getSheetByName("OTPs");
  const userSheet = ss.getSheetByName("Users") || ss.insertSheet("Users");

  // Verify OTP (Compare as strings to avoid Type errors)
  const otps = otpSheet.getDataRange().getValues();
  const validOtp = otps.find(row =>
    row[0].toString().trim() === user.email.toString().trim() &&
    row[1].toString().trim() === user.otp.toString().trim()
  );

  if (!validOtp) return createResponse({ status: "error", message: "Invalid or expired OTP" });

  // Check if PRN or Email exists
  const users = userSheet.getDataRange().getValues();
  if (users.some(r => r[0] === user.prn || r[1] === user.email)) {
    return createResponse({ status: "error", message: "PRN or Email already registered" });
  }

  // Register Account (Columns: PRN, Email, Name, Branch, Year, VotedProjects)
  userSheet.appendRow([user.prn, user.email, user.name, user.branch, user.year, "[]"]);
  return createResponse({ status: "success", message: "Registration successful!" });
}

// 🔑 3. LOGIN
function handleLogin(prn) {
  const userSheet = ss.getSheetByName("Users") || ss.insertSheet("Users");
  const data = userSheet.getDataRange().getValues();
  const user = data.find(row => row[0].toString() === prn.toString());

  if (!user) return createResponse({ status: "error", message: "User not found. Please sign up." });

  return createResponse({
    status: "success",
    prn: user[0],
    name: user[2],
    branch: user[3],
    year: user[4],
    votedProjects: JSON.parse(user[5] || "[]")
  });
}

// 📋 4. FETCH PROJECTS
function handleGetProjects() {
  const sheet = ss.getSheetByName("Projects") || ss.insertSheet("Projects");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const projects = data.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return createResponse({ status: "success", projects: projects });
}

// 🗳️ 5. VOTE
function handleVote(prn, projectId, voteType) {
  const voteSheet = ss.getSheetByName("Votes") || ss.insertSheet("Votes");
  const userSheet = ss.getSheetByName("Users");
  const projectSheet = ss.getSheetByName("Projects");

  // Duplicate check
  const votes = voteSheet.getDataRange().getValues();
  if (votes.some(v => v[0].toString() === prn.toString() && v[1].toString() === projectId.toString())) {
    return createResponse({ status: "error", message: "Already voted for this team" });
  }

  voteSheet.appendRow([prn, projectId, voteType, new Date()]);

  // Update User state
  const users = userSheet.getDataRange().getValues();
  for (let i = 0; i < users.length; i++) {
    if (users[i][0].toString() === prn.toString()) {
      let voted = JSON.parse(users[i][5] || "[]");
      voted.push(projectId);
      userSheet.getRange(i + 1, 6).setValue(JSON.stringify(voted));
      break;
    }
  }

  // Update Project Vote Count for Leaderboard
  const projects = projectSheet.getDataRange().getValues();
  const headers = projects[0];
  const voteCol = headers.indexOf('votesCount') + 1;
  if (voteCol > 0) {
    for (let i = 0; i < projects.length; i++) {
      if (projects[i][0].toString() === projectId.toString()) {
        let count = parseInt(projects[i][voteCol - 1] || 0) + 1;
        projectSheet.getRange(i + 1, voteCol).setValue(count);
        break;
      }
    }
  }

  return createResponse({ status: "success", message: "Vote Cast Successfully!" });
}

// 📊 6. ADMIN SUMMARY & LEADERBOARD
function handleAdminStats() {
  const projectSheet = ss.getSheetByName("Projects");
  const voteSheet = ss.getSheetByName("Votes") || ss.insertSheet("Votes");
  const userSheet = ss.getSheetByName("Users") || ss.insertSheet("Users");
  
  const projects = projectSheet.getDataRange().getValues();
  const votes = voteSheet.getDataRange().getValues();
  const users = userSheet.getDataRange().getValues();
  
  const headers = projects.shift();
  const projectStats = projects.map(p => {
    const id = p[0].toString();
    const pVotes = votes.filter(v => v[1].toString() === id);
    
    return {
      id: id,
      title: p[1],
      teamName: p[2],
      bestCount: pVotes.filter(v => v[2] === "best").length,
      goodCount: pVotes.filter(v => v[2] === "good").length,
      moderateCount: pVotes.filter(v => v[2] === "moderate").length,
      totalVotes: pVotes.length
    };
  });
  
  const mix = {
    best: votes.filter(v => v[2] === "best").length,
    good: votes.filter(v => v[2] === "good").length,
    moderate: votes.filter(v => v[2] === "moderate").length
  };
  
  return createResponse({
    status: "success",
    totalProjects: projects.length,
    totalVotes: votes.length - 1,   // Subtract header
    totalStudents: users.length - 1, // Subtract header
    projects: projectStats,
    mix: mix
  });
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
