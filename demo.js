/*
  Welcome to the Demo for the Web Cabin Docker!
*/
$(document).ready(function() {
  // --------------------------------------------------------------------------------
  // Create an instance of our docker window and assign it to the document.
  var myDocker = new wcDocker('.dockerContainer');
  if (myDocker) {

    var _currentTheme = 'Default';
    var _showingInfo  = true;
    var _savedLayouts = [];
    var _chatterIndex = 1;

    // --------------------------------------------------------------------------------
    // Register the top panel, this is the static panel at the top of the window
    // that can not be moved or adjusted.  Note that this panel is also marked as
    // 'isPrivate', which means the user will not get the option to create more of these.
    myDocker.registerPanelType('Top Panel', {
      isPrivate: true,
      onCreate: function(myPanel) {
        // Add some text information into the panel
        myPanel.layout().addItem($('<div style="text-align:center"><strong>Welcome to the Web Cabin Docker!</strong><br>Web Cabin Docker is a docking panel layout interface written in JavaScript under the <a href="http://www.opensource.org/licenses/mit-license.php">MIT License</a>.</div>'), 0, 0);
        myPanel.layout().addItem($('<div style="text-align:center">View the source here: <a href="https://github.com/WebCabin/wcDocker">https://github.com/WebCabin/wcDocker</a></div>'), 0, 1);

        // Constrain the sizing of this window so the user can't resize it.
        myPanel.initSize(Infinity, 100);
        myPanel.minSize(100, 100);
        myPanel.maxSize(Infinity, 100);
        myPanel.title(false);

        // Do not allow the user to move or remove this panel, this will remove the title bar completely from the frame.
        myPanel.moveable(false);
        myPanel.closeable(false);
      }
    });

    // --------------------------------------------------------------------------------
    // Register the control panel, this one has a few controls that allow you to change
    // dockers theme as well as layout configuration controls.
    myDocker.registerPanelType('Control Panel', {
      faicon: 'gears',
      onCreate: function(myPanel) {
        myPanel.initSize(800, 400);
        myPanel.layout().$table.css('padding', '10px');

        var $infoText = $('<div class="info" style="background-color:lightgray;margin-bottom:20px;">This is the control panel!  Here you will find controls for changing docker-wide options.  Try changing the theme or saving the current panel layout configuration and then restore it later.</div>');
        
        // Toggle info button.
        var $toggleInfoButton = $('<button class="toggleInfo" style="width:100%;height:100%;">Hide All Info Text</button>');
        if (!_showingInfo) {
          $infoText.hide();
          $toggleInfoButton.text('Show All Info Text');
        }

        // Create our theme dropdown menu.
        var $themeLabel       = $('<div style="width:100%;text-align:right;margin-top:20px;white-space:nowrap;">Select theme: </div>');
        var $themeSelector    = $('<select class="themeSelector" style="margin-top:20px;width:100%">');
        $themeSelector.append('<option value="Default">Default</option>');
        $themeSelector.append('<option value="bigRed">Big Red</option>');
        $themeSelector.append('<option value="shadow">Shadow</option>');
        $themeSelector.val(_currentTheme);

        // Pre-configured layout configurations.
        var $layoutNameLabel  = $('<div style="white-space:nowrap;text-align:right;">Layout: </div>');
        var $layoutNameEdit   = $('<input type="text" placeholder="Layout Name" style="width:100%"></input>');
        var $saveButton       = $('<button style="width:100%;">Save Layout</button>');

        var $layoutListLabel = $('<div style="white-space:nowrap;width:100%;text-align:center;">Restore layout: </div>');
        var $layoutList = $('<select class="layoutSelector" style="width:100%;">');
        $layoutList.append('<option value="">&lt;Choose one&gt;</option>');
        for (var i = 0; i < _savedLayouts.length; ++i) {
          $layoutList.append('<option value="' + _savedLayouts[i].name + '">' + _savedLayouts[i].name + '</option>');
        }

        myPanel.layout().startBatch();
        myPanel.layout().addItem($infoText, 0, 0, 2, 1);
        myPanel.layout().addItem($toggleInfoButton, 1, 1).css('text-align', 'left');
        myPanel.layout().addItem($themeLabel, 0, 2).css('text-align', 'right').css('width', '1%');
        myPanel.layout().addItem($themeSelector, 1, 2).css('text-align', 'left');

        myPanel.layout().addItem('<div style="height: 20px;"></div>', 0, 3, 2, 1);
        myPanel.layout().addItem($layoutNameLabel, 0, 4);
        myPanel.layout().addItem($layoutNameEdit, 1, 4);
        myPanel.layout().addItem($layoutListLabel, 0, 5);
        myPanel.layout().addItem($layoutList, 1, 5);
        myPanel.layout().addItem($saveButton, 1, 6);
        myPanel.layout().finishBatch();

        // Here we do some css table magic to make all other cells align to the top of the window.
        // The returned element from addItem is always the <td> of the table, its' parent is the <tr>
        myPanel.layout().addItem('<div>', 0, 10, 2, 1).parent().css('height', '100%');

        $toggleInfoButton.click(function() {
          _showingInfo = !_showingInfo;
          $('.info').each(function() {
            if (_showingInfo) {
              $(this).fadeIn();
            } else {
              $(this).fadeOut();
            }
          });

          $('.toggleInfo').each(function() {
            if (_showingInfo) {
              $(this).text('Hide All Info Text');
            } else {
              $(this).text('Show All Info Text');
            }
          });
        });

        // Bind an event to catch when the theme has been changed.
        $themeSelector.change(function() {
          _currentTheme = $themeSelector.find('option:selected').val();

          // To load a theme, you just need to create a new 'link' element that includes the theme css file.
          // First we remove any already existing theme, so they don't conflict.
          $('#theme').remove();

          // The default theme requires no additional theme css file.
          if (_currentTheme !== 'Default') {
            $('head').append($('<link id="theme" rel="stylesheet" type="text/css" href="Themes/' + _currentTheme + '.css"/>'));
          }

          // In case there are multiple control panels, make sure every theme selector are updated with the new theme.
          $('.themeSelector').each(function() {
            if (this !== $themeSelector[0]) {
              $(this).val(_currentTheme);
            }
          });
        });

        // Disable the restore layout button if there are no layouts to restore.
        // $restoreButton.attr('disabled', _savedLayouts.length? false: true);

        // Setup a click handler for the save button.
        var saveTimer = 0;
        $saveButton.click(function() {
          // Save the layout.
          var layoutConfig = myDocker.save();

          // Add the saved layout into the saved layout list.
          var foundLayout = false;
          var layoutName = $layoutNameEdit.val();
          if (!layoutName) {
            layoutName = 'Default';
          }
          for (var i = 0; i < _savedLayouts.length; ++i) {
            if (_savedLayouts[i].name === layoutName) {
              foundLayout = true;
              _savedLayouts[i].data = layoutConfig;
              break;
            }
          }
          if (!foundLayout) {
            _savedLayouts.push({
              name: layoutName,
              data: layoutConfig,
            });
          }

          // Update all saved layout list boxes with the new list.
          $('.layoutSelector').each(function() {
            var $selector = $(this);
            $selector.children().remove();
            $selector.append('<option value="">&lt;Choose one&gt;</option>');
    
            for (var i = 0; i < _savedLayouts.length; ++i) {
              $selector.append('<option value="' + _savedLayouts[i].name + '">' + _savedLayouts[i].name + '</option>');
            }
          });

          // Enable all restore buttons on the page, as there may be more than one control panel open.
          $saveButton.html('<b>Layout Saved!</b>');
          $('.restoreButton').each(function() {
            $(this).attr('disabled', false);
          });

          // Notify the user that the layout is saved by changing the button text and restoring it after a time delay.
          if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = 0;
          }
          saveTimer = setTimeout(function() {
            $saveButton.text('Save Layout');
            saveTimer = 0;
          }, 500);
        });

        // Restore a layout whenever a selection on the layout list is changed.
        $layoutList.change(function() {
          var str = '';
          var value = $('option:selected', this).val();
          if (value) {
            for (var i = 0; i < _savedLayouts.length; ++i) {
              if (_savedLayouts[i].name === value) {
                myDocker.restore(_savedLayouts[i].data);
              }
            }
          }
        });
      }
    });

    // --------------------------------------------------------------------------------
    // Register the chat panel, a demonstration of the built in panel event/messaging
    // system to communicate between multiple chat panels.
    myDocker.registerPanelType('Chat Panel', {
      faicon: 'comment-o',
      onCreate: function(myPanel) {
        myPanel.initSize(400, 400);
        myPanel.layout().$table.css('padding', '10px');

        var $infoText = $('<div class="info" style="background-color:lightgray;margin-bottom:20px;">This is the chat panel!  Here is a simple demonstration of the built in event/messaging system between panels.  Give yourself a name and then send a message, all chat panels will receive your message and display it.</div>');
        if (!_showingInfo) {
          $infoText.hide();
        }

        // Create our chat window.
        var $senderLabel    = $('<div style="white-space:nowrap;">Sender Name: </div>');
        var $senderName     = $('<input type="text" style="width:100%;padding:0px;" placeholder="Sender name here" value="Chatter' + _chatterIndex++ + '"/>');

        var $chatArea       = $('<textarea style="width:100%;height:100%;padding:0px;margin-top:10px;border:0px;"></textarea>');
        var $chatEdit       = $('<input type="text" style="width:100%;padding:0px;" placeholder="Type a message here!"/>');
        var $chatSend       = $('<button>Send</button>');
        var $chatContainer  = $('<table style="width:100%;"><tr><td></td><td></td></tr></table>');
        $chatContainer.find('td').first().append($chatEdit).css('width', '100%');
        $chatContainer.find('td').last().append($chatSend).css('width', '1%');

        myPanel.layout().addItem($infoText, 0, 0, 2, 1);
        myPanel.layout().addItem($senderLabel, 0, 1).css('width', '1%');
        myPanel.layout().addItem($senderName, 1, 1).css('width', '100%');
        var chatCell = myPanel.layout().addItem($chatArea, 0, 2, 2, 1);
        myPanel.layout().addItem($chatContainer, 0, 3, 2, 1);

        chatCell.parent().css('height', '100%');

        // Send a chat message.
        function onChatSent() {
          var sender = $senderName.val();
          var message = $chatEdit.val();

          // Use our built in event/messaging system, this sends a message
          // of name "Message" to anyone who is listening to it, and sends
          // a data object that describes the message.
          myPanel.trigger('Message', {
            sender: sender,
            message: message,
          });

          $chatEdit.val('');
        };

        $chatEdit.keypress(function(event) {
          if (event.keyCode == 13) {
            onChatSent();
          }
        });
        $chatSend.click(onChatSent);

        // Register this panel to listen for any messages of type "Message".
        myPanel.on('Message', function(data) {
          // The data passed in is the data object sent by the sender.
          var text = data.sender + ': ' + data.message + '\n';
          $chatArea.html($chatArea.html() + text);
        });
      }
    });

    // --------------------------------------------------------------------------------
    // Register the batch panel, a demonstration of the layout batch system when
    // adding an overwhelming number of elements into the layout all at once.
    myDocker.registerPanelType('Batch Panel', {
      faicon: 'cubes',
      onCreate: function(myPanel) {
        myPanel.initSize(400, 400);
        myPanel.layout().$table.css('padding', '10px');

        var $infoText = $('<div class="info" style="background-color:lightgray;margin-bottom:20px;">This is the batch panel!  Here illustrates a comparison between adding layout items one at a time vs using the batching system.  The batching system avoids re-calculating elements each time a new one is added until the batch has been finished.  Use this if you are adding a large number of elements into the panel\'s layout.</div>');
        if (!_showingInfo) {
          $infoText.hide();
        }

        var $clearItemsButton   = $('<button style="white-space:nowrap;">Clear Items</buttons>');
        var $normalAddButton    = $('<button style="white-space:nowrap;margin-left:10px;margin-right:10px;">Add Items Normally</button>');
        var $batchAddButton     = $('<button style="white-space:nowrap;">Add Items Batched</button>');

        myPanel.layout().addItem($infoText, 0, 0, 3, 1);
        myPanel.layout().addItem($clearItemsButton, 0, 1).css('text-align', 'right');
        myPanel.layout().addItem($normalAddButton, 1, 1).css('width', '1%');
        myPanel.layout().addItem($batchAddButton, 2, 1);

        // Here we do some css table magic to make all other cells align to the top of the window.
        // The returned element from addItem is always the <td> of the table, its' parent is the <tr>
        myPanel.layout().addItem('<div>', 0, 3).parent().css('height', '100%');

        var currentItemIndex = 0;
        function __addItems() {
          myPanel.layout().item(0, currentItemIndex+3).css('height', '');

          // Add a large number of items into the layout.
          var min = 0;
          var max = 2;
          for (var i = 0; i < 250; ++i) {
            currentItemIndex++;
            var randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
            var $item = null;
            switch (randomInt) {
              case 0:
                $item = $('<div>Some Random Text Item</div>');
                break;
              case 1:
                $item = $('<input placeholder="Some Random Text Input"/>');
                break;
              case 2:
                $item = $('<button>Some Random Button</button>');
                break;
            }
            if ($item) {
              myPanel.layout().addItem($item, 0, currentItemIndex+3, 3, 1).css('border-bottom', '2px solid black').css('padding-bottom', '5px').css('text-align', 'center');
            }
          }
        };

        $clearItemsButton.click(function() {
          $('body').append($clearItemsButton).append($normalAddButton).append($batchAddButton);
          myPanel.layout().clear();
          myPanel.layout().$table.css('padding', '10px');
          myPanel.layout().addItem($infoText, 0, 0, 3, 1);
          myPanel.layout().addItem($clearItemsButton, 0, 1).css('text-align', 'right');
          myPanel.layout().addItem($normalAddButton, 1, 1).css('width', '1%');
          myPanel.layout().addItem($batchAddButton, 2, 1);

          // Here we do some css table magic to make all other cells align to the top of the window.
          // The returned element from addItem is always the <td> of the table, its' parent is the <tr>
          myPanel.layout().addItem('<div>', 0, 3).parent().css('height', '100%');
          currentItemIndex = 0;
        });

        $normalAddButton.click(function() {
          __addItems();
        });

        $batchAddButton.click(function() {
          myPanel.layout().startBatch();
          __addItems();
          myPanel.layout().finishBatch();
        });
      }
    });

    // --------------------------------------------------------------------------------
    // Register the reaction panel, demonstrates the event handler system.
    myDocker.registerPanelType('Reaction Panel', {
      faicon:'refresh',
      onCreate: function(myPanel) {
        myPanel.layout().$table.css('padding', '10px');

        var $infoText = $('<div class="info" style="background-color:lightgray;margin-bottom:20px;">This is the reaction panel!  Get notifications for common events by using the built in event system.</div>');
        if (!_showingInfo) {
          $infoText.hide();
        }

        // Setup a number of different text alerts that can be displayed based on certain events.
        var $buttonInfo   = $('<div style="text-align:center">I react to the custom buttons above</div>');
        var $buttonN      = $('<div style="text-align:center"><b>Happy button pressed!</b></div>');
        var $buttonTtrue  = $('<div style="text-align:center"><b>Thumbs button is down!</b></div>');
        var $buttonTfalse = $('<div style="text-align:center"><b>Thumbs button is up!</b></div>');
        var buttonTimer;

        var $attachInfo   = $('<div style="text-align:center">I react when docked</div>');
        var $attached     = $('<div style="text-align:center"><b>I was just docked!</b></div>');
        var $detachInfo   = $('<div style="text-align:center">I react when detached</div>');
        var $detached     = $('<div style="text-align:center"><b>I was just detached!</b></div>');
        var attachTimer;

        var $moveInfo     = $('<div style="text-align:center">I react on move</div>');
        var $moved        = $('<div style="text-align:center"><b>I was just moved!</b></div>');
        var moveTimer;

        var $resizeInfo   = $('<div style="text-align:center">I react on resize</div>');
        var $resized      = $('<div style="text-align:center"><b>I was just resized!</b></div>');
        var resizeTimer;

        myPanel.layout().addItem($infoText, 0, 0);
        myPanel.layout().addItem($buttonInfo, 0, 1);
        myPanel.layout().addItem($detachInfo, 0, 2);
        myPanel.layout().addItem($moveInfo, 0, 3);
        myPanel.layout().addItem($resizeInfo, 0, 4);
        myPanel.layout().addItem($('<div style="text-align:center">Lastly, if you can see my tab icon, it will only be spinning when my panel is visible</div>'), 0, 4);

        // Add some custom buttons that will appear in the upper right corner of the panel.
        myPanel.addButton('Thumbs Button', 'fa fa-thumbs-up', 'T', 'A toggle button', true, 'fa fa-thumbs-down');
        myPanel.addButton('Happy Button', 'fa fa-smile-o', ':)', 'A normal button', false);

        // React on custom button press.
        myPanel.on(wcDocker.EVENT_BUTTON, function(data) {
          if (buttonTimer) {
            clearTimeout(buttonTimer);
          }

          if (data.name === 'Happy Button') {
            // Show an alert when the smile face button is clicked.
            this.layout().item(0, 1).empty();
            this.layout().addItem($buttonN, 0, 1);

            var self = this;
            buttonTimer = setTimeout(function() {
              self.layout().item(0, 1).empty();
              self.layout().addItem($buttonInfo, 0, 1);
              buttonTimer = 0;
            }, 1000);
          } else if (data.name === 'Thumbs Button') {
            // Show an alert when the thumbs button is toggled.
            this.layout().item(0, 1).empty();
            this.layout().addItem((data.isToggled? $buttonTtrue: $buttonTfalse), 0, 1)

            var self = this;
            buttonTimer = setTimeout(function() {
              self.layout().item(0, 1).empty();
              self.layout().addItem($buttonInfo, 0, 1);
              buttonTimer = 0;
            }, 1000);
          }
        });

        // React when this panel was floating and is now attached to a docking position.
        myPanel.on(wcDocker.EVENT_ATTACHED, function() {
          if (attachTimer) {
            clearTimeout(attachTimer);
          }

          this.layout().item(0, 2).empty();
          this.layout().addItem($attached, 0, 2);

          var self = this;
          attachTimer = setTimeout(function() {
            self.layout().item(0, 2).empty();
            self.layout().addItem($detachInfo, 0, 2);
            attachTimer = 0;
          }, 1000);
        });

        // React when this panel was docked and is now floating.
        myPanel.on(wcDocker.EVENT_DETACHED, function() {
          if (attachTimer) {
            clearTimeout(attachTimer);
          }

          this.layout().item(0, 2).empty();
          this.layout().addItem($detached, 0, 2);

          var self = this;
          attachTimer = setTimeout(function() {
            self.layout().item(0, 2).empty();
            self.layout().addItem($attachInfo, 0, 2);
            attachTimer = 0;
          }, 1000);
        });

        // React when this panel's top left position has changed.
        myPanel.on(wcDocker.EVENT_MOVED, function() {
          if (moveTimer) {
            clearTimeout(moveTimer);
          }

          this.layout().item(0, 3).empty();
          this.layout().addItem($moved, 0, 3);

          var self = this;
          moveTimer = setTimeout(function() {
            self.layout().item(0, 3).empty();
            self.layout().addItem($moveInfo, 0, 3);
            moveTimer = 0;
          }, 500);
        });

        // React on resizing.
        myPanel.on(wcDocker.EVENT_RESIZED, function() {
          if (resizeTimer) {
            clearTimeout(resizeTimer);
          }

          this.layout().item(0, 4).empty();
          this.layout().addItem($resized, 0, 4);

          var self = this;
          resizeTimer = setTimeout(function() {
            self.layout().item(0, 4).empty();
            self.layout().addItem($resizeInfo, 0, 4);
            resizeTimer = 0;
          }, 500);
        });

        myPanel.on(wcDocker.EVENT_VISIBILITY_CHANGED, function() {
          if (this.isVisible()) {
            this.faicon('refresh fa-spin');
          } else {
            this.faicon('refresh');
          }
        });
      }
    });

    // --------------------------------------------------------------------------------
    // Register the widget panel, a demonstration of some of the built in
    // panel widget items.
    myDocker.registerPanelType('Widget Panel', {
      faicon: 'trophy',
      onCreate: function(myPanel) {
        myPanel.initSize(400, 400);
        myPanel.layout().showGrid(true);
        myPanel.layout().$table.css('padding', '10px');

        var $infoText = $('<div class="info" style="background-color:lightgray;margin-bottom:20px;">This is the widget panel!  A demonstration of some of the custom layout widgets provided for you by wcDocker.</div>');
        if (!_showingInfo) {
          $infoText.hide();
        }

        // We need at least one element in the main layout that can hold the splitter.  We give it classes wcWide and wcTall
        // to size it to the full size of the panel.
        var $scene = $('<div style="width:100%;height:100%;position:relative;">')

        myPanel.layout().addItem($infoText, 0, 0);
        myPanel.layout().addItem($scene, 0, 1).parent().css('height', '100%');


        // Here we can utilize the splitter used by wcDocker internally so that we may split up
        // a single panel.  Splitters can be nested, and new layouts can be created to fill
        // each side of the split.
        var splitter = new wcSplitter($scene, myPanel, wcDocker.ORIENTATION_HORIZONTAL);

        // Initialize this splitter with a layout in each pane.  This can be done manually, but
        // it is more convenient this way.
        splitter.initLayouts();

        // By default, the splitter splits down the middle, but the position can be assigned manually by giving it a percentage value from 0-1.
        splitter.pos(0.25);

        // Put some content in each layout.
        // splitter.pane(0).addItem($('<div style="text-align:center">This panel is partitioned by it\'s own resizable splitter!</div>'));
        // splitter.pane(1).addItem($('<div style="text-align:center">Each side of the splitter has it\'s own layout.<br><br>Toggle the rotation button in the upper right to change the orientation of the splitter.</div>'));

        // We need to update the splitter whenever the panel is updated.
        myPanel.on(wcDocker.EVENT_UPDATED, function() {
          splitter.update();
          // tabs.update();
        });

        // Add a rotation panel button to change the orientation of the splitter.
        myPanel.addButton('View', 'verticalPanelButton', 'O', 'Switch between horizontal and vertical layout.', true, 'horizontalPanelButton');
        myPanel.on(wcDocker.EVENT_BUTTON, function(data) {
          splitter.orientation(data.isToggled);
        });
      }
    });

    // --------------------------------------------------------------------------------
    // Here we actually add all of our registered panels into our document.
    // The order that each panel is added makes a difference.  In general, start
    // by creating the center panel and work your way outwards in all directions.
    var batchPanel = myDocker.addPanel('Batch Panel', wcDocker.DOCK_BOTTOM, false);
    var topChatPanel = myDocker.addPanel('Chat Panel', wcDocker.DOCK_LEFT, false);
    var widgetPanel = myDocker.addPanel('Widget Panel', wcDocker.DOCK_RIGHT, false);
    var controlPanel = myDocker.addPanel('Control Panel', wcDocker.DOCK_RIGHT, false, batchPanel);
    var reactionPanel = myDocker.addPanel('Reaction Panel', wcDocker.DOCK_BOTTOM, false, batchPanel);
    var bottomChatPanel = myDocker.addPanel('Chat Panel', wcDocker.DOCK_BOTTOM, false, topChatPanel);

    myDocker.addPanel('Top Panel', wcDocker.DOCK_TOP, false);
  }
});