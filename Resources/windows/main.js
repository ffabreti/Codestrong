/**
 * This file is part of DrupalCon Mobile.
 *
 * DrupalCon Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * DrupalCon Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with DrupalCon Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {

/*
  // Add a menu to all pages except news (which would be confusing).
  tabGroup.addEventListener('focus', function(e) {
    //dpm(e.index);
    if (e.index != 1 && e.index !=2 && e.index != 4){
      if (isAndroid()){
        // Android has a menu
        var buttons = [];
        buttons.push({
          title: "Update",
          clickevent: function () {
            Ti.fireEvent('drupalcon:update_data');
          }
        });
        menu.init({
          win: tabGroup.tabs[e.index].window,
          buttons: buttons
        });
      }
      else {
        
        // iOS should only have the button.
        var button = Ti.UI.createButton({
          systemButton: Ti.UI.iPhone.SystemButton.REFRESH
        });
        var win = tabGroup.tabs[e.index].window;
        win.rightNavButton = button;
        button.addEventListener('click', function() {
          Ti.fireEvent('drupalcon:update_data');
        });
      }
    }
  });
*/

  	// lock orientation to portrait
  	Codestrong.navWindow.orientationModes = [Ti.UI.PORTRAIT];
  	//Ti.UI.orientation = Ti.UI.PORTRAIT;
  
  	// create main dashboard window
  	var mainWindow = Ti.UI.createWindow({
		backgroundImage: Codestrong.settings.mainBG,
		title: 'Dashboard',
		navBarHidden: true
  	});
  	var viewFade = Ti.UI.createView({
  		backgroundColor: '#fff',
  		borderColor:'#888',
  		borderWidth: 4,
  		height: Codestrong.settings.dashboardHeight,
  		width: Codestrong.settings.dashboardWidth,
  		bottom: 20,
  		opacity: 0.75,
  		borderRadius: 8
  	});
  	var viewIcons = Ti.UI.createView({
  		height: Codestrong.settings.dashboardHeight,
  		width: Codestrong.settings.dashboardWidth,
  		bottom: 20,
  		borderRadius: 8,
  		layout: 'horizontal'
  	});
  	mainWindow.add(viewFade);
  	mainWindow.add(viewIcons);
  
  	if (isAndroid()) {
  		Codestrong.navGroup = {
  			open: function(win, obj) {
  				win.open(obj);	
  			},
  			close: function(win, obj) {
  				win.close(obj);	
  			}
  		};
  		Codestrong.navWindow = mainWindow;
  	} else {
	    Codestrong.navGroup = Ti.UI.iPhone.createNavigationGroup({
	  		window: mainWindow
	    });
	  	Codestrong.navWindow.add(Codestrong.navGroup);
  	}
  
  var createIconView = function(iconImage, iconWin, hasRefresh) {
  	var view = Ti.UI.createView({ 
  		backgroundImage: iconImage, 
  		height: Codestrong.settings.iconHeight, 
  		width: Codestrong.settings.iconWidth
  	});
  	view.addEventListener('click', function(e) {
  		var leftButton = Ti.UI.createButton({
	    	backgroundImage: 'images/6dots.png',
	    	width: 41,
	    	height: 30
	    });
	    leftButton.addEventListener('click', function(e) {
	    	Codestrong.navGroup.close(iconWin, {animated:true});
	    });
	    iconWin.leftNavButton = leftButton;
	    
	    if (hasRefresh) {
	    	if (isAndroid()) {
	    		// add menu
	    	} else {
		    	var rightButton = Ti.UI.createButton({
		          systemButton: Ti.UI.iPhone.SystemButton.REFRESH
		        });
		        iconWin.rightNavButton = rightButton;
		        rightButton.addEventListener('click', function() {
		          Ti.fireEvent('drupalcon:update_data');
		        });
	        }
	    }
	    
		iconWin.navBarHidden = false;
  		Codestrong.navGroup.open(iconWin, {animated:true});
  	});
  	return view;
  };
  
  var presentersWindow = DrupalCon.ui.createPresentersWindow();
  viewIcons.add(createIconView(Codestrong.settings.icons.schedule, DrupalCon.ui.createDayWindow(), true));
  viewIcons.add(createIconView(Codestrong.settings.icons.maps, DrupalCon.ui.createMapWindow()));
  viewIcons.add(createIconView(Codestrong.settings.icons.news, DrupalCon.ui.createTwitterWindow()));
  viewIcons.add(createIconView(Codestrong.settings.icons.speakers, presentersWindow, true));
  viewIcons.add(createIconView(Codestrong.settings.icons.sponsors, DrupalCon.ui.createHtmlWindow({url: Codestrong.settings.sponsorsPage, title:'Sponsors'})));
  viewIcons.add(createIconView(Codestrong.settings.icons.about, DrupalCon.ui.createAboutWindow()));

  
  Codestrong.navWindow.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});

  var updateCount = 0;
  Ti.addEventListener('drupal:entity:datastore:update_completed', function(e) {
  	updateCount++;
  	if (updateCount >= 2) {
  		updateCount = 0;
  		if (presentersWindow) {
  			presentersWindow.doRefresh();
  		}
  		DrupalCon.ui.activityIndicator.hideModal();
  	}
  });

  Ti.addEventListener('drupalcon:update_data', function(e) {
  	DrupalCon.ui.activityIndicator.showModal('Loading sessions and speakers...');
    Drupal.entity.db('main', 'node').fetchUpdates('session');
    Drupal.entity.db('main', 'user').fetchUpdates('user');
  });

})();
