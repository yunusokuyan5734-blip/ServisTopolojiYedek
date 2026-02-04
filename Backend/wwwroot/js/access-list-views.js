// Giriş Yetkililer - View Geçişleri
document.addEventListener('DOMContentLoaded', function() {
    const showUsersViewBtn = document.getElementById('showUsersViewBtn');
    const showMappingsViewBtn = document.getElementById('showMappingsViewBtn');
    const usersListView = document.getElementById('usersListView');
    const mappingsListView = document.getElementById('mappingsListView');
    const accessListTitle = document.getElementById('accessListTitle');
    const addUserBtn = document.getElementById('addUserBtn');

    // Kullanıcı listesini göster
    function showUsersView() {
        if (usersListView) usersListView.style.display = 'block';
        if (mappingsListView) mappingsListView.style.display = 'none';
        if (showUsersViewBtn) showUsersViewBtn.style.display = 'none';
        if (showMappingsViewBtn) {
            showMappingsViewBtn.style.display = 'inline-flex';
            showMappingsViewBtn.style.background = '#6366f1';
        }
        if (accessListTitle) accessListTitle.textContent = 'Yetkili Kullanıcılar';
        if (addUserBtn) addUserBtn.style.display = 'inline-flex';
    }

    // AD Grup eşleştirmelerini göster
    function showMappingsView() {
        if (usersListView) usersListView.style.display = 'none';
        if (mappingsListView) mappingsListView.style.display = 'block';
        if (showUsersViewBtn) {
            showUsersViewBtn.style.display = 'inline-flex';
            showUsersViewBtn.style.background = '#6366f1';
        }
        if (showMappingsViewBtn) showMappingsViewBtn.style.display = 'none';
        if (accessListTitle) accessListTitle.textContent = 'AD Grup Eşleştirmeleri';
        if (addUserBtn) addUserBtn.style.display = 'none';
        
        // Eşleştirmeleri yükle
        if (typeof loadLdapMappings === 'function') {
            loadLdapMappings();
        }
    }

    // Buton event listener'ları
    if (showUsersViewBtn) {
        showUsersViewBtn.addEventListener('click', showUsersView);
    }

    if (showMappingsViewBtn) {
        showMappingsViewBtn.addEventListener('click', showMappingsView);
    }

    // Sayfa yüklendiğinde varsayılan olarak kullanıcı listesini göster
    showUsersView();
});
