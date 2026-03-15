const map1 = document.getElementById('map1');
const map2 = document.getElementById('map2');
const log = document.getElementById('log');
const resetBtn = document.getElementById('resetBtn');

async function fetchSeats() {
    try {
        const res = await fetch('/seats');
        const seats = await res.json();
        renderMap(map1, seats, "A");
        renderMap(map2, seats, "B");
    } catch (err) {
        console.error("Lỗi fetch seats:", err);
    }
}

function renderMap(container, seats, userName) {
    container.innerHTML = '';
    seats.forEach(seat => {
        const div = document.createElement('div');
        div.className = `seat ${seat.is_booked ? 'booked' : ''}`;
        div.innerText = seat.seat_number;
        
        if (seat.is_booked) {
            div.title = `Người đặt: ${seat.booked_by}`;
        } else {
            div.onclick = () => bookSeat(seat.id, userName);
        }
        container.appendChild(div);
    });
}

async function bookSeat(seatId, userName) {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const endpoint = mode === 'safe' ? '/book-safe' : '/book-unsafe';
    
    addLog(`[Hệ thống] User ${userName} đang gửi yêu cầu đặt vé...`);
    
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seatId, userName })
        });
        
        const data = await res.json();
        if (res.ok) {
            addLog(`[Thành công] ${data.message}`);
        } else {
            addLog(`[Thất bại] ${data.error}`);
        }
    } catch (err) {
        addLog(`[Lỗi] Không thể kết nối tới server`);
    }
    
    fetchSeats();
}

async function resetAll() {
    await fetch('/reset-seats', { method: 'POST' });
    addLog("[Hệ thống] Đã đặt lại toàn bộ trạng thái ghế.");
    fetchSeats();
}

function addLog(msg) {
    const p = document.createElement('p');
    p.innerText = `${new Date().toLocaleTimeString()} - ${msg}`;
    log.prepend(p);
}

resetBtn.onclick = resetAll;
fetchSeats();
// Tự động cập nhật mỗi 2 giây để thấy sự thay đổi đồng bộ
setInterval(fetchSeats, 2000);
