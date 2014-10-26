define([
        'renderer/src/renderer',
        './turnManager',
        './unitActions',
        './map',
        './soldier',
        'renderer/src/ui/actionPanel',
        'renderer/src/ui/confirmationPanel',
        './utility',
        './inputHandler',
        'renderer/src/ui/unitStatusPanel',
        './options'
    ],
    function (Renderer, TurnManager, UnitActions,
        Map, Soldier, ActionPanel, ConfirmationPanel, Utility, InputHandler, UnitStatusPanel,
        Options)
    {
        'use strict';

        function getOption(key, isSelection)
        {
            return Options[key] === 'always' || (isSelection && Options[key] === 'selected');
        }

        return {

            loadGame: function (socket, gameLogic, game, levelData)
            {
                InputHandler.enableInput();

                this.socket = socket;
                this.gameLogic = gameLogic;
                this.currentGame = game;
                this.currentMap = levelData.map;
                this.turnManager = new TurnManager();
                this.actionList = [];
                this.actionPanel = new ActionPanel();
                this.actionPanel.on('actionSelected', this, this.onActionSelected);
                this.unitActions = new UnitActions(this.gameLogic, this.currentMap);

                this.socket.on(this.socket.events.gameStateUpdate.response.success, function ()
                {
                    this.actionList = [];
                }.bind(this));

                Renderer.addRenderableMap(this.currentMap);

                for (var i = 0; i < game.units.length; ++i)
                {
                    var unit = new Soldier(game.units[i]);
                    unit.isLocal = (game.units[i].username === this.socket.user.username);
                    unit.statusPanel = new UnitStatusPanel(this.socket.user.username);
                    unit.statusPanel.open(unit);
                    //unit.on('death', this.onSoldierDeath.bind(this));

                    this.currentMap.addUnit(unit, unit.x, unit.y);
                    this.turnManager.addUnit(unit);
                    Renderer.addRenderableSoldier(unit);
                }

                this.beginTurn(this.onCameraMoved.bind(this));
            },

            getUnitStatusPanelOptions: function (unit, isSelection)
            {
                var options = {};
                options.showTurnIndicator = getOption('showTurnIndicator', isSelection);

                if (unit.username === this.socket.user.username)
                {
                    options.showHP = getOption('showTeamHP', isSelection);
                    options.showAP = getOption('showTeamAP', isSelection);
                }
                else
                {
                    options.showHP = getOption('showEnemyHP', isSelection);
                    options.showAP = getOption('showEnemyAP', isSelection);
                }

                if (options.showHP || options.showAP || options.showTurnIndicator)
                    return options;
            },

            beginTurn: function (callback)
            {
                this.turnManager.beginTurn();

                var unit = this.turnManager.activeUnit;

                Renderer.camera.moveToUnit(this.turnManager.activeUnit, callback);

                if (this.actionList.length > 0 && !unit.isLocal)
                {
                    // The local player is out of moves
                    this.socket.emit(this.socket.events.gameStateUpdate.url,
                    {
                        gameID: this.currentGame._id,
                        actions: this.actionList
                    });
                }
            },

            onCameraMoved: function (unit)
            {
                if (!unit.isLocal)
                {
                    return;
                }

                this.actionPanel.open(unit, this.gameLogic.getAttacks(unit));

                this.resetActionState();
            },

            onActionSelected: function (unit, action)
            {
                Renderer.clearRenderablePaths();
                this.actionPanel.hide();

                if (action.name === 'endturn')
                {
                    this.endTurn();
                    return;
                }

                if (action.name === 'move')
                {
                    Renderer.addRenderablePath('moveTiles', this.availableMoveNodes, false);
                    this.currentMap.on('tileClick', this, this.onMoveTileSelected);
                }
                else
                {
                    this.currentAttack = action;
                    Renderer.addRenderablePath('attack', this.availableAttackNodes[action.name], false);
                    this.currentMap.on('tileClick', this, this.onAttackTileSelected);
                }

                this.confirmationPanel = new ConfirmationPanel();
                this.confirmationPanel.on('actionSelected', this, this.onPerformActionSelected);
                this.confirmationPanel.showCancel(unit);
            },

            onMoveTileSelected: function (tile, x, y)
            {
                Renderer.clearRenderablePathById('selectedPath');

                this.actionPanel.target.statusPanel.previewAP();
                this.confirmationPanel.disableConfirm();
                this.confirmationPanel.target = {
                    x: x,
                    y: y
                };

                var pathNode = tile && Utility.getElementByProperty(this.availableMoveNodes, 'tile', tile);
                if (pathNode)
                {
                    this.selectedNodes = this.gameLogic.calculatePathFromNodes(pathNode, this.actionPanel.target.x, this.actionPanel.target.y);
                    this.selectedNode = this.selectedNodes[this.selectedNodes.length - 1];
                    this.actionPanel.target.statusPanel.previewAP(this.gameLogic.getMoveCost(this.actionPanel.target, this.selectedNode.distance));

                    Renderer.addRenderablePath('selectedPath', this.selectedNodes, true);
                    Renderer.camera.moveToUnit(this.selectedNode, function ()
                    {
                        this.confirmationPanel.enableConfirm();
                    }.bind(this), 0.5);
                }
                else
                {
                    this.confirmationPanel.showCancel(this.actionPanel.target);
                }
            },

            onPerformActionSelected: function (actionName)
            {
                if (actionName === 'confirm')
                {
                    if (this.currentAttack)
                        this.onAttackConfirmed();
                    else
                        this.onMoveConfirmed();
                }
                else
                {
                    this.resetActionState();
                    Renderer.camera.moveToUnit(this.turnManager.activeUnit);
                }
            },

            onMoveConfirmed: function ()
            {
                InputHandler.disableInput();
                Renderer.clearRenderablePaths();
                this.actionPanel.hide();
                this.actionPanel.target.statusPanel.previewAP();

                this.unitActions.move(this.actionPanel.target, this.selectedNodes, this.resetActionState.bind(this));

                var endTileNode = this.selectedNodes[this.selectedNodes.length - 1];
                this.onLocalUnitMove(this.currentMap, this.actionPanel.target, endTileNode.x, endTileNode.y);
            },

            resetActionState: function ()
            {
                this.selectedNode = null;
                this.selectedNodes = null;
                this.currentAttack = null;
                this.availableAttackNodes = {};

                var unit = this.turnManager.activeUnit;

                this.availableMoveNodes = this.gameLogic.getMoveNodes(this.currentMap, unit);
                if (this.availableMoveNodes.length === 0)
                {
                    this.actionPanel.disableAction('move');
                }

                var attacks = this.gameLogic.getAttacks(unit);
                for (var i = 0; i < attacks.length; ++i)
                {
                    var attack = attacks[i];
                    this.availableAttackNodes[attack.name] = this.gameLogic.attacks[attack.name].getAttackNodes(this.currentMap, unit);
                    if (this.availableAttackNodes[attack.name].length === 0)
                    {
                        this.actionPanel.disableAction(attack.name);
                    }
                }

                unit.statusPanel.previewAP();
                Renderer.clearRenderablePaths();
                this.actionPanel.updateActions();
                this.actionPanel.show();

                this.currentMap.off('tileClick', this, this.onMoveTileSelected);
                this.currentMap.off('tileClick', this, this.onAttackTileSelected);
                InputHandler.enableInput();
            },

            onAttackTileSelected: function (tile, x, y)
            {
                this.selectedNode = tile && Utility.getElementByProperty(this.availableAttackNodes[this.currentAttack.name], 'tile', tile);
                if (!this.selectedNode)
                {
                    this.confirmationPanel.disableConfirm();
                    this.confirmationPanel.showCancel(this.turnManager.activeUnit);
                    return;
                }

                this.confirmationPanel.disableConfirm();

                Renderer.clearRenderablePathById('selectedAttackNodes');

                this.confirmationPanel.target = {
                    x: x,
                    y: y
                };

                var attackName = this.currentAttack.name.toLowerCase();

                this.selectedNodes = this.gameLogic.attacks[attackName].getTargetNodes(this.selectedNode);
                var hasTarget = this.gameLogic.hasTarget(this.selectedNodes);

                if (hasTarget)
                {
                    Renderer.camera.moveToUnit(this.confirmationPanel.target, function ()
                    {
                        this.confirmationPanel.enableConfirm();
                    }.bind(this), 0.5);

                    var baseCost = this.gameLogic.attacks[attackName].attackCost;
                    var totalCost = this.gameLogic.getAttackCost(this.turnManager.activeUnit, this.selectedNode, baseCost);

                    this.turnManager.activeUnit.statusPanel.previewAP(totalCost);
                    Renderer.addRenderablePath('selectedAttackNodes', this.selectedNodes, true);
                }
                else
                {
                    this.turnManager.activeUnit.statusPanel.previewAP();
                    this.confirmationPanel.showCancel(this.turnManager.activeUnit);
                }
            },

            onAttackConfirmed: function ()
            {
                InputHandler.disableInput();
                Renderer.clearRenderablePaths();
                this.actionPanel.hide();
                this.turnManager.activeUnit.statusPanel.previewAP();

                var hitChance = this.gameLogic.nextRandom(this.currentGame);

                this.unitActions.attack(this.turnManager.activeUnit, this.selectedNode, this.currentAttack.name, hitChance, this.resetActionState.bind(this));
                this.onLocalUnitAttack(this.turnManager.activeUnit, this.selectedNode, this.currentAttack.name);
            },

            onAttackComplete: function ()
            {
                InputHandler.enableInput();
            },

            endTurn: function ()
            {
                if (this.turnManager.activeUnit.username === this.socket.user.username)
                {
                    this.actionList.push(
                    {
                        type: "endTurn"
                    });
                }

                this.turnManager.endTurn();

                Renderer.clearRenderablePaths();
                this.beginTurn(this.onCameraMoved.bind(this));
            },

            onLocalUnitAttack: function (unit, targetNode, attackName)
            {
                // TODO Just pass x and y for tiles
                this.actionList.push(
                {
                    type: attackName,
                    unitID: unit._id,
                    targetX: targetNode.x,
                    targetY: targetNode.y
                });
            },

            onLocalUnitMove: function (map, unit, x, y)
            {
                this.actionList.push(
                {
                    type: "move",
                    unitID: unit._id.toString(),
                    x: x,
                    y: y
                });
            },

            onPlayerDefeat: function (player)
            {
                console.log('player ' + player.name + ' defeated');
            },

            onGameStateUpdateReceived: function (actions)
            {
                this.performActions(actions);
            },

            performActions: function (actions)
            {
                var action = actions.shift();
                var actionType = action.type.toLowerCase();
                switch (actionType)
                {

                case "move":
                    {
                        var unit = this.turnManager.activeUnit;
                        var moveNodes = this.gameLogic.getMoveNodes(this.currentMap, unit);

                        for (var i = 0; i < moveNodes.length; ++i)
                        {
                            var node = moveNodes[i];
                            if (node.x === action.x && node.y === action.y)
                            {
                                this.selectedNodes = this.gameLogic.calculatePathFromNodes(node, unit.x, unit.y);
                                this.unitActions.move(this.turnManager.activeUnit, this.selectedNodes, this.performActions.bind(this, actions));
                            }
                        }

                        break;
                    }

                case "endturn":
                    {
                        // Nothing to validate
                        this.endTurn();

                        if (actions.length === 0)
                        {
                            this.beginTurn(this.onCameraMoved.bind(this));
                            return;
                        }
                        this.beginTurn(this.performActions.bind(this, actions));

                        break;
                    }

                default:
                    var attackLogic = this.gameLogic.attacks[actionType];
                    var attackingUnit = this.turnManager.activeUnit;
                    var targetUnit = this.currentMap.getTile(action.targetX, action.targetY).unit;

                    attackingUnit.target = targetUnit;

                    var attackNodes = attackLogic.getAttackNodes(this.currentMap, attackingUnit);
                    for (var j = 0; j < attackNodes.length; ++j)
                    {
                        var attackNode = attackNodes[j];
                        if (attackNode.x === action.targetX && attackNode.y === action.targetY)
                        {
                            attackingUnit.direction = this.gameLogic.getDirection(attackingUnit, attackNode);
                            attackingUnit.ap -= this.gameLogic.getAttackCost(attackingUnit, attackNode, attackLogic.attackCost);

                            // attackLogic.performAttack(attackingUnit, attackNode);
                            this.unitActions.attack(attackingUnit, attackNode, actionType, this.performActions.bind(this, actions));
                        }
                    }
                    return;

                }
            }
        };
    });
