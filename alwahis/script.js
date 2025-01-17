import { supabaseQueries } from './supabase-config.js';

// DOM Elements
const searchForm = document.getElementById('search-form');
const publishForm = document.getElementById('publish-form');
const requestForm = document.getElementById('request-form');
const browseRequestsForm = document.getElementById('browse-requests-form');
const ridesList = document.getElementById('rides-list');
const requestsList = document.getElementById('requests-list');
const loading = document.getElementById('loading');
const navLinks = document.querySelectorAll('.nav-link');
const menuToggle = document.querySelector('.menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

// View Management
function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.querySelector(`.${viewName}-view`).classList.add('active');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        showView(view);
        if (window.innerWidth <= 768) {
            navLinksContainer.classList.remove('active');
        }
    });
});

menuToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
});

// Format date and time
function formatDateTime(date, time) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString('ar-IQ', options);
    return `${formattedDate} - ${time}`;
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('ar-IQ').format(price) + ' د.ع';
}

// Create ride card
function createRideCard(ride) {
    const card = document.createElement('div');
    card.className = 'ride-card';
    
    card.innerHTML = `
        <h3><i class="fas fa-car"></i> ${ride.start_point} إلى ${ride.end_point}</h3>
        <div class="ride-details">
            <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>${formatDateTime(ride.date, ride.time)}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-users"></i>
                <span>${ride.seats} مقاعد</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-money-bill-wave"></i>
                <span>${formatPrice(ride.price)}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-user"></i>
                <span>${ride.driver_name}</span>
            </div>
        </div>
        <a href="${ride.whatsapp_link}" target="_blank" class="whatsapp-btn">
            <i class="fab fa-whatsapp"></i>
            تواصل عبر واتساب
        </a>
    `;
    
    return card;
}

// Create request card
function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = 'request-card';
    
    card.innerHTML = `
        <h3><i class="fas fa-search"></i> ${request.start_point} إلى ${request.end_point}</h3>
        <div class="request-details">
            <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>${formatDateTime(request.date, '00:00')}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-users"></i>
                <span>${request.seats_needed} ركاب</span>
            </div>
            ${request.max_price ? `
                <div class="detail-item">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>حد أقصى ${formatPrice(request.max_price)}</span>
                </div>
            ` : ''}
            <div class="detail-item">
                <i class="fas fa-user"></i>
                <span>${request.rider_name}</span>
            </div>
        </div>
        <a href="${request.whatsapp_link}" target="_blank" class="whatsapp-btn">
            <i class="fab fa-whatsapp"></i>
            تواصل عبر واتساب
        </a>
    `;
    
    return card;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Update loading state
function setLoading(isLoading) {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = isLoading ? 'flex' : 'none';
}

// Show loading
function showLoading() {
    setLoading(true);
}

// Hide loading
function hideLoading() {
    setLoading(false);
}

// Search rides
async function searchRides(startPoint, endPoint, date) {
    showLoading();
    try {
        console.log('Searching rides with:', { startPoint, endPoint, date });
        
        // Validate inputs
        if (!startPoint?.trim() && !endPoint?.trim() && !date?.trim()) {
            throw new Error('الرجاء إدخال معلومات البحث');
        }
        
        // Check Supabase initialization
        if (!window.supabase) {
            console.error('Supabase not initialized');
            throw new Error('خطأ في الاتصال بقاعدة البيانات');
        }
        
        const { data: rides, error } = await supabaseQueries.searchRides(startPoint, endPoint, date);
        
        if (error) {
            console.error('Search error:', error);
            throw error;
        }
        
        console.log('Search results:', rides);
        
        ridesList.innerHTML = '';
        if (!rides || rides.length === 0) {
            ridesList.innerHTML = `
                <div class="card">
                    <p>لا توجد رحلات متوفرة</p>
                    <button onclick="window.location.reload()" class="retry-button">
                        <i class="fas fa-sync-alt"></i>
                        تحديث
                    </button>
                </div>`;
            return;
        }
        
        rides.forEach(ride => {
            ridesList.appendChild(createRideCard(ride));
        });
    } catch (error) {
        console.error('Error searching rides:', error);
        const errorMessage = error.message || 'حدث خطأ في جلب الرحلات';
        showError(errorMessage);
        ridesList.innerHTML = `
            <div class="card">
                <p class="error">${errorMessage}</p>
                <button onclick="window.location.reload()" class="retry-button">
                    <i class="fas fa-sync-alt"></i>
                    حاول مرة أخرى
                </button>
            </div>`;
    } finally {
        hideLoading();
    }
}

// Event Listeners
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const startPoint = formData.get('startPoint')?.trim();
    const endPoint = formData.get('endPoint')?.trim();
    const date = formData.get('date')?.trim();
    
    if (!startPoint && !endPoint && !date) {
        showError('الرجاء إدخال معلومات البحث');
        return;
    }
    
    await searchRides(startPoint, endPoint, date);
});

publishForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    
    try {
        const formData = new FormData(e.target);
        const rideData = {
            startPoint: formData.get('startPoint'),
            endPoint: formData.get('endPoint'),
            date: formData.get('date'),
            time: formData.get('time'),
            seats: formData.get('seats'),
            price: formData.get('price'),
            driverName: formData.get('driverName'),
            driverPhone: formData.get('driverPhone')
        };
        
        const { error } = await supabaseQueries.createRide(rideData);
        if (error) throw error;
        
        showSuccess('تم نشر الرحلة بنجاح');
        e.target.reset();
        showView('search');
    } catch (error) {
        console.error('Error publishing ride:', error);
        showError('حدث خطأ أثناء نشر الرحلة');
    } finally {
        hideLoading();
    }
});

requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    
    try {
        const formData = new FormData(e.target);
        const requestData = {
            startPoint: formData.get('startPoint'),
            endPoint: formData.get('endPoint'),
            date: formData.get('date'),
            seatsNeeded: formData.get('seatsNeeded'),
            maxPrice: formData.get('maxPrice'),
            riderName: formData.get('riderName'),
            riderPhone: formData.get('riderPhone')
        };
        
        const { error } = await supabaseQueries.createRequest(requestData);
        if (error) throw error;
        
        showSuccess('تم نشر الطلب بنجاح');
        e.target.reset();
        showView('browse-requests');
    } catch (error) {
        console.error('Error publishing request:', error);
        showError('حدث خطأ أثناء نشر الطلب');
    } finally {
        hideLoading();
    }
});

browseRequestsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await searchRequests(
        formData.get('startPoint'),
        formData.get('endPoint'),
        formData.get('date')
    );
});

// Search requests
async function searchRequests(startPoint, endPoint, date) {
    showLoading();
    try {
        const { data: requests, error } = await supabaseQueries.searchRequests(startPoint, endPoint, date);
        if (error) throw error;
        
        requestsList.innerHTML = '';
        if (requests.length === 0) {
            requestsList.innerHTML = '<div class="card"><p>لا توجد طلبات متوفرة</p></div>';
            return;
        }
        
        requests.forEach(request => {
            requestsList.appendChild(createRequestCard(request));
        });
    } catch (error) {
        console.error('Error searching requests:', error);
        showError('حدث خطأ أثناء البحث');
        requestsList.innerHTML = '<div class="card"><p class="error">حدث خطأ أثناء البحث</p></div>';
    } finally {
        hideLoading();
    }
}

// Check for search parameters in URL
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const startPoint = urlParams.get('from');
    const endPoint = urlParams.get('to');
    const date = urlParams.get('date');
    
    if (startPoint || endPoint || date) {
        // Fill the search form
        const form = document.getElementById('search-form');
        if (form) {
            if (startPoint) form.querySelector('[name="startPoint"]').value = startPoint;
            if (endPoint) form.querySelector('[name="endPoint"]').value = endPoint;
            if (date) form.querySelector('[name="date"]').value = date;
            
            // Trigger search
            searchRides(startPoint, endPoint, date);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    handleUrlParameters();
    showView('search');
});

// Real-time updates
supabaseQueries.subscribeToRides(payload => {
    if (payload.eventType === 'INSERT' && document.querySelector('.search-view.active')) {
        const { startPoint, endPoint, date } = searchForm;
        searchRides(startPoint.value, endPoint.value, date.value);
    }
});

supabaseQueries.subscribeToRequests(payload => {
    if (payload.eventType === 'INSERT' && document.querySelector('.browse-requests-view.active')) {
        const { startPoint, endPoint, date } = browseRequestsForm;
        searchRequests(startPoint.value, endPoint.value, date.value);
    }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
